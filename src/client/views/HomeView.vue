<script setup lang="ts"></script>

<template>
  <main>
    <ul>
      <li>
        <h2>Routers</h2>
        <ol>
          <li><a href="https://192.168.2.1">My Router</a></li>
          <li><a href="https://192.168.1.1">Massave Router</a></li>
        </ol>
      </li>
      <li>
        <h2>Pages</h2>
        <ol>
          <li><a href="https://pluto/motion">Door Camera</a></li>
          <li><a href="http://pluto:8023">DNS</a></li>
        </ol>
      </li>
      <li>
        <h2>CGI BIN</h2>
        <ol>
          <li><a href="https://pluto/cgi-bin/power-usage.py">Power Usage Graph</a></li>
          <li><a href="https://pluto/cgi-bin/dns-usage.py">DNS Usage Logs</a></li>
          <li><a href="https://pluto/cgi-bin/youtube-dl.py">Youtube download</a></li>
        </ol>
      </li>
    </ul>
  </main>
</template>
<style scoped>
a {
  line-height: 1.5;
}
</style>
