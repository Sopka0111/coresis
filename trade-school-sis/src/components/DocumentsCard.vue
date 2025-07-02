<template>
  <v-card elevation="2" class="documents-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 d-flex align-center">
        <v-icon left color="primary">mdi-file-document-multiple</v-icon>
        Documents
        <v-badge
          v-if="totalDocuments > 0"
          :content="totalDocuments > 99 ? '99+' : totalDocuments.toString()"
          color="primary"
          class="ml-2"
        />
      </span>
      <div class="d-flex align-center">
        <v-btn 
          icon 
          size="small"
          variant="text"
          @click="handleUpload"
          title="Upload Document"
          class="mr-2"
        >
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-btn 
          icon 
          color="primary"
          @click="handleAddDocument"
          title="Add Document"
        >
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <!-- Category Filter -->
      <div class="pa-4 pb-2">
        <v-select
          density="compact"
          hide-details
          variant="outlined"
          :items="categories"
          item-title="label"
          item-value="value"
          v-model="selectedCategory"
          @update:model-value="handleCategoryChange"
          label="Filter by Category"
          prepend-inner-icon="mdi-filter"
          clearable
        />
      </div>

      <!-- Documents List -->
      <div class="documents-container">
        <v-list v-if="filteredDocuments.length" density="compact" class="pa-0">
          <v-list-item 
            v-for="(doc, index) in filteredDocuments" 
            :key="doc.id || index"
            class="document-item"
            @click="handleDocumentClick(doc)"
          >
            <template #prepend>
              <v-avatar :color="getFileTypeColor(doc.type)" size="40">
                <v-icon color="white" size="20">
                  {{ getFileTypeIcon(doc.type) }}
                </v-icon>
              </v-avatar>
            </template>
            
            <v-list-item-content>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ doc.name }}
                <v-chip 
                  v-if="doc.category" 
                  :color="getCategoryColor(doc.category)" 
                  size="x-small" 
                  class="ml-2"
                >
                  {{ doc.category }}
                </v-chip>
                <v-chip 
                  v-if="doc.isNew" 
                  color="success" 
                  size="x-small" 
                  class="ml-1"
                >
                  New
                </v-chip>
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-caption">
                <div class="d-flex align-center mt-1">
                  <v-icon size="12" class="mr-1">mdi-calendar</v-icon>
                  {{ formatDate(doc.date) }}
                  <span v-if="doc.size" class="ml-2">
                    • {{ formatFileSize(doc.size) }}
                  </span>
                  <span v-if="doc.uploadedBy" class="ml-2">
                    • {{ doc.uploadedBy }}
                  </span>
                </div>
                <div v-if="doc.description" class="text-caption mt-1">
                  {{ doc.description }}
                </div>
              </v-list-item-subtitle>
            </v-list-item-content>
            
            <template #append>
              <div class="d-flex align-center">
                <v-btn 
                  icon 
                  size="small"
                  variant="text"
                  @click.stop="handleDownload(doc)"
                  title="Download"
                >
                  <v-icon size="16">mdi-download</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  size="small"
                  variant="text"
                  @click.stop="handleEditDocument(doc)"
                  title="Edit document"
                >
                  <v-icon size="16">mdi-pencil</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  size="small"
                  variant="text"
                  color="error"
                  @click.stop="handleDeleteDocument(doc)"
                  title="Delete document"
                >
                  <v-icon size="16">mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
        
        <v-alert 
          v-else 
          type="info" 
          border="start" 
          elevation="1" 
          class="ma-4"
        >
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          No documents {{ selectedCategory ? `in ${selectedCategory}` : 'available' }}.
        </v-alert>
      </div>
    </v-card-text>
    
    <!-- Summary Footer -->
    <v-card-actions v-if="totalDocuments > 0" class="pa-4 pt-0">
      <div class="d-flex align-center">
        <v-icon size="16" class="mr-2">mdi-file-document</v-icon>
        <span class="text-caption">
          {{ filteredDocuments.length }} of {{ totalDocuments }} documents
        </span>
        <span v-if="totalSize" class="text-caption ml-4">
          • {{ formatFileSize(totalSize) }} total
        </span>
      </div>
      <v-spacer />
      <v-btn 
        variant="text" 
        color="primary"
        @click="handleViewAll"
      >
        View All Documents
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon left color="primary">mdi-upload</v-icon>
          Upload Document
        </v-card-title>
        <v-card-text>
          <v-file-input
            v-model="uploadFile"
            label="Select File"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            prepend-icon="mdi-file"
            show-size
            counter
            @change="handleFileSelect"
          />
          <v-select
            v-model="uploadCategory"
            :items="categories"
            item-title="label"
            item-value="value"
            label="Category"
            class="mt-4"
          />
          <v-text-field
            v-model="uploadDescription"
            label="Description (optional)"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="showUploadDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="handleUploadConfirm"
            :disabled="!uploadFile"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface Document {
  id?: number
  name: string
  description?: string
  date: string
  size?: number
  type?: string
  category?: string
  uploadedBy?: string
  href?: string
  isNew?: boolean
  filePath?: string
}

interface Category {
  label: string
  value: string
  color?: string
}

// Props
interface Props {
  maxHeight?: string
  showBadge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '400px',
  showBadge: true
})

// Emits
const emit = defineEmits<{
  'add-document': []
  'edit-document': [document: Document]
  'delete-document': [document: Document]
  'document-click': [document: Document]
  'download-document': [document: Document]
  'upload-document': [file: File, category: string, description: string]
  'category-change': [category: string]
  'view-all': []
}>()

// Reactive data
const selectedCategory = ref<string>('')
const showUploadDialog = ref(false)
const uploadFile = ref<File | null>(null)
const uploadCategory = ref<string>('')
const uploadDescription = ref<string>('')

// Categories
const categories = ref<Category[]>([
  { label: 'All Categories', value: '', color: 'primary' },
  { label: 'Enrollment', value: 'enrollment', color: 'success' },
  { label: 'Curriculum', value: 'curriculum', color: 'info' },
  { label: 'Administrative', value: 'administrative', color: 'warning' },
  { label: 'Financial', value: 'financial', color: 'error' },
  { label: 'Student Records', value: 'student-records', color: 'purple' },
  { label: 'Forms', value: 'forms', color: 'teal' },
  { label: 'Policies', value: 'policies', color: 'orange' }
])

// Sample documents data
const documents = ref<Document[]>([
  {
    id: 1,
    name: 'Enrollment Packet 2025',
    description: 'Complete enrollment forms and requirements for new students',
    date: '2025-06-25T10:00:00Z',
    size: 2048576, // 2MB
    type: 'pdf',
    category: 'enrollment',
    uploadedBy: 'Admin User',
    isNew: true,
    href: '#'
  },
  {
    id: 2,
    name: 'Swedish Massage Course Syllabus',
    description: 'Detailed course outline and learning objectives',
    date: '2025-06-24T14:30:00Z',
    size: 1048576, // 1MB
    type: 'docx',
    category: 'curriculum',
    uploadedBy: 'Faculty',
    href: '#'
  },
  {
    id: 3,
    name: 'Student Handbook 2025',
    description: 'Comprehensive guide for student policies and procedures',
    date: '2025-06-23T09:15:00Z',
    size: 3145728, // 3MB
    type: 'pdf',
    category: 'policies',
    uploadedBy: 'Admin User',
    href: '#'
  },
  {
    id: 4,
    name: 'Financial Aid Application',
    description: 'Application form for student financial assistance',
    date: '2025-06-22T16:45:00Z',
    size: 512000, // 500KB
    type: 'pdf',
    category: 'financial',
    uploadedBy: 'Financial Aid Office',
    href: '#'
  },
  {
    id: 5,
    name: 'Student Progress Report Template',
    description: 'Standard template for student progress evaluation',
    date: '2025-06-21T11:20:00Z',
    size: 819200, // 800KB
    type: 'xlsx',
    category: 'student-records',
    uploadedBy: 'Faculty',
    href: '#'
  },
  {
    id: 6,
    name: 'Equipment Inventory Checklist',
    description: 'Monthly inventory check form for massage equipment',
    date: '2025-06-20T13:10:00Z',
    size: 256000, // 250KB
    type: 'xlsx',
    category: 'administrative',
    uploadedBy: 'Facilities Manager',
    href: '#'
  }
])

// Computed properties
const filteredDocuments = computed(() => {
  if (!selectedCategory.value) {
    return documents.value
  }
  return documents.value.filter(doc => doc.category === selectedCategory.value)
})

const totalDocuments = computed(() => documents.value.length)

const totalSize = computed(() => {
  return documents.value.reduce((total, doc) => total + (doc.size || 0), 0)
})

// Methods
const handleCategoryChange = (category: string): void => {
  emit('category-change', category)
  console.log('Category filter changed:', category)
}

const handleAddDocument = (): void => {
  emit('add-document')
  console.log('Add document clicked')
}

const handleUpload = (): void => {
  showUploadDialog.value = true
}

const handleFileSelect = (file: File | null): void => {
  if (file) {
    console.log('File selected:', file.name)
  }
}

const handleUploadConfirm = (): void => {
  if (uploadFile.value) {
    emit('upload-document', uploadFile.value, uploadCategory.value, uploadDescription.value)
    console.log('Upload confirmed:', uploadFile.value.name)
    
    // Reset form
    uploadFile.value = null
    uploadCategory.value = ''
    uploadDescription.value = ''
    showUploadDialog.value = false
  }
}

const handleEditDocument = (doc: Document): void => {
  emit('edit-document', doc)
  console.log('Edit document:', doc.name)
}

const handleDeleteDocument = (doc: Document): void => {
  emit('delete-document', doc)
  console.log('Delete document:', doc.name)
}

const handleDocumentClick = (doc: Document): void => {
  emit('document-click', doc)
  console.log('Document clicked:', doc.name)
}

const handleDownload = (doc: Document): void => {
  emit('download-document', doc)
  console.log('Download document:', doc.name)
}

const handleViewAll = (): void => {
  emit('view-all')
  console.log('View all documents clicked')
}

const formatDate = (date: string): string => {
  const docDate = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays <= 7) {
    return `${diffInDays} days ago`
  } else {
    return docDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileTypeIcon = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return 'mdi-file-pdf-box'
    case 'doc':
    case 'docx':
      return 'mdi-file-word-box'
    case 'xls':
    case 'xlsx':
      return 'mdi-file-excel-box'
    case 'ppt':
    case 'pptx':
      return 'mdi-file-powerpoint-box'
    case 'txt':
      return 'mdi-file-document'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'mdi-file-image-box'
    default:
      return 'mdi-file-document'
  }
}

const getFileTypeColor = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return 'error'
    case 'doc':
    case 'docx':
      return 'primary'
    case 'xls':
    case 'xlsx':
      return 'success'
    case 'ppt':
    case 'pptx':
      return 'warning'
    case 'txt':
      return 'grey'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'info'
    default:
      return 'primary'
  }
}

const getCategoryColor = (category?: string): string => {
  const cat = categories.value.find(c => c.value === category)
  return cat?.color || 'primary'
}

// Lifecycle
onMounted(() => {
  console.log('DocumentsCard mounted')
})
</script>

<style scoped>
.documents-card {
  border-radius: 12px;
}

.documents-container {
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}

.document-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.document-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-list-item-content {
  padding-right: 8px;
}

/* Custom scrollbar for documents container */
.documents-container::-webkit-scrollbar {
  width: 6px;
}

.documents-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.documents-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.documents-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Upload dialog styling */
.v-dialog .v-card {
  border-radius: 12px;
}

.v-file-input {
  margin-bottom: 16px;
}
</style> 