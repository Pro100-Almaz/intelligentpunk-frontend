<template>
  <div>
    <div class="mb-3 flex justify-between items-center">
      <h2 class="text-xl font-medium text-gray-400">Latest Usage</h2>
      <button class="text-black text-sm font-medium underline hover:no-underline">
        View all
      </button>
    </div>

    <!-- Individual Project Items -->
    <div v-for="project in projects" :key="project.id" class="bg-white dark:bg-gray-900 rounded-lg p-2 mb-2 last:mb-0 w-full">
      <div class="grid grid-cols-6 gap-2 items-center">
        <!-- Column 1: Tool Image (1/6) -->
        <div class="col-span-1 flex justify-center">
          <UAvatar :src="project.icon" size="lg" />
        </div>
        
        <!-- Column 2: Name, Time, and Button (4/6) -->
        <div class="col-span-4 flex flex-col space-y-1">
          <div class="font-bold text-sm">{{ project.title }}</div>
          <div class="text-xs text-gray-500">{{ project.time }}</div>
          <UButton 
            class="w-fit text-xs"
          >
            Go to studio
          </UButton>
        </div>
        
        <!-- Column 3: Settings Dropdown (1/6) -->
        <div class="col-span-1 flex justify-end">
          <UDropdownMenu :items="settingsMenuItems">
            <UButton 
              color="gray" 
              variant="ghost" 
              size="sm"
              square
            >
              <UIcon name="i-heroicons-ellipsis-vertical" class="size-4" />
            </UButton>
          </UDropdownMenu>
        </div>
      </div>
    </div>

  </div>
  
  </template>
  
  <script setup>
  defineProps({
    projects: {
      type: Array,
      required: true
    }
  })

  // Default settings menu options
  const settingsMenuItems = [
    [{
      label: 'Edit Project',
      icon: 'i-heroicons-pencil',
      click: () => {
        console.log('Edit project clicked')
        // Add edit functionality here
      }
    }, {
      label: 'Duplicate',
      icon: 'i-heroicons-document-duplicate',
      click: () => {
        console.log('Duplicate project clicked')
        // Add duplicate functionality here
      }
    }, {
      label: 'Share',
      icon: 'i-heroicons-share',
      click: () => {
        console.log('Share project clicked')
        // Add share functionality here
      }
    }], [{
      label: 'Archive',
      icon: 'i-heroicons-archive-box',
      click: () => {
        console.log('Archive project clicked')
        // Add archive functionality here
      }
    }, {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => {
        console.log('Delete project clicked')
        // Add delete functionality here
      }
    }]
  ]
  </script>