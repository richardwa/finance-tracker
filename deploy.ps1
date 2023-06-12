if (-not (Test-Path -Path Dockerfile)) {
  Write-Host "Dockerfile required at current directory"
  Exit
}
$currentDirectoryPath = Get-Location
$projectName = Split-Path -Leaf $currentDirectoryPath

git add .
git commit -m"update"
npm run build
$gitHash = & git rev-parse HEAD
$shortGitHash = $gitHash.Substring(0, 6)
$tag = "${projectName}:$shortGitHash"
Write-Output "commit: $gitHash, date: $(Date)" > ./build/client/version.txt

$targetHost = 'rich@omv'
# prepare server
ssh $targetHost "rm -rf $projectName && mkdir $projectName"

# Iterate through the Dockerfile content and extract COPY lines
$dockerfileContent = Get-Content -Path Dockerfile
$copyPattern = '^\s*COPY\s+(?<source>.*?)\s+(?<destination>.*?)\s*$'
$dockerfileContent | Where-Object { $_ -match $copyPattern } | ForEach-Object {
  $source = $Matches['source']
  $destination = $Matches['destination']

  $target = Join-Path -Path $projectName -ChildPath $destination
  $target = $target -replace '\\', '/'
  scp -r $source "${targetHost}:~/$target" 
}
scp Dockerfile "${targetHost}:~/$projectName"

# generate remote script for deployment
$script = @"
echo "first line not executed - not sure why"

#!/bin/bash
cd $projectName
pwd
docker build -t $tag .

# Check if the container is running
if docker container inspect -f '{{.State.Running}}' "$projectName" >/dev/null 2>&1; then
  # Stop the container
  docker container stop "$projectName"
  echo "Container $projectName stopped."
fi

# Check if the container exists
if docker container inspect "$projectName" >/dev/null 2>&1; then
  # Remove the container
  docker container rm "$projectName"
  echo "Container $projectName removed."
else
  echo "Container $projectName does not exist."
fi

nohup docker run -d \
  -e TZ=America/New_York \
  -p 8080:8080 \
  -v ${projectName}:/app/data \
  --restart=unless-stopped \
  --name $projectName \
  $tag `&
"@
Write-Host $script
$script = $script -replace "`r", ""
ssh rich@omv bash -c $script