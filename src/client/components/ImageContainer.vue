<script setup lang="ts">
import type { Item } from '@/client/stores/inventory-store'
import { ref } from 'vue'
import LightBoxVue from './LightBox.vue'
import { getThumbUrl, getImageUrl } from '@/client/stores/file-service'

defineProps<{
  selected?: Item
}>()
const emit = defineEmits(['file', 'delete'])
const onFileChanged = (ev: Event) => {
  const target = ev.target as HTMLInputElement
  if (target.files && target.files.length) {
    emit('file', ...Array.from(target.files))
  }
}

const paste = async () => {
  try {
    const permission = await navigator.permissions.query({
      name: 'clipboard-read' as PermissionName
    })
    if (permission.state === 'denied') {
      throw new Error('Not allowed to read clipboard.')
    }
    const clipboardContents = await navigator.clipboard.read()
    for (const item of clipboardContents) {
      if (!item.types.includes('image/png')) {
        throw new Error('Clipboard contains non-image data.')
      }
      const blob = await item.getType('image/png')
      emit('file', blob)
    }
  } catch (error) {
    console.error(error)
  }
}

const showImage = ref<string>()
</script>
<template>
  <div class="images">
    <div v-if="selected" class="h-box">
      <span class="heading">{{ selected?.title }}</span>
      <button @click="paste"><i class="fa fa-clipboard" aria-hidden="true"></i> paste image</button>
      <input type="file" @change="onFileChanged" accept="*" capture multiple="true" />
    </div>
    <img
      v-for="src in selected?.images"
      :key="src"
      class="thumb"
      :src="getThumbUrl(src)"
      @click="showImage = getImageUrl(src)"
    />
    <LightBoxVue v-if="showImage" @close="showImage = undefined">
      <img class="showImage" :src="showImage" />
      <div class="h-box justify">
        <button @click="showImage = undefined">close</button>
        <button @click="$emit('delete', showImage)">delete</button>
      </div>
    </LightBoxVue>
  </div>
</template>
<style scoped>
.h-box {
  white-space: nowrap;
}
.showImage {
  max-width: 80vw;
  max-height: 60vh;
}
.heading {
  margin-left: var(--gap);
  font-size: 2rem;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
}
button,
input {
  margin: var(--gap) 0 0 var(--gap);
  height: unset;
  width: 10rem;
  flex-shrink: 0;
}
input[type='file']::file-selector-button {
  width: 10rem;
  padding: 0.5rem 1rem;
  border: 1px solid gray;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

input[type='file'] {
  padding: 0;
  border: none;
  margin-right: var(--gap);
}
.images {
  min-height: 20rem;
  background-color: rgba(200, 200, 200, 0.9);
  flex-shrink: 1;
  flex-grow: 1;
}
.thumb {
  border: 1px solid gray;
  margin: 1rem 0 0 1rem;
  cursor: pointer;
}
</style>
