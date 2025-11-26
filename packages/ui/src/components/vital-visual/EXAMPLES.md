# VITAL Visual Component Library - Usage Examples

Comprehensive examples for all components in the VITAL visual asset library.

## Table of Contents
1. [SuperAgentIcon Examples](#superagenticon-examples)
2. [Icon Examples](#icon-examples)
3. [AgentAvatar Examples](#agentavatar-examples)
4. [IconPicker Examples](#iconpicker-examples)
5. [AvatarGrid Examples](#avatargrid-examples)
6. [Real-World Integration Examples](#real-world-integration-examples)

---

## SuperAgentIcon Examples

### Basic Usage
```tsx
import { SuperAgentIcon } from '@vital/ui'

function BasicSuperAgent() {
  return (
    <SuperAgentIcon
      name="super_orchestrator"
      size="lg"
      variant="purple"
    />
  )
}
```

### With Custom Background
```tsx
function CustomBackgroundSuperAgent() {
  return (
    <SuperAgentIcon
      name="master_strategist"
      size="xl"
      variant="blue"
      backgroundColor="#FFFFFF"
    />
  )
}
```

### With Loading State
```tsx
function LoadingSuperAgent() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000)
  }, [])

  return (
    <SuperAgentIcon
      name="super_orchestrator"
      size="lg"
      variant="purple"
      loading={loading}
    />
  )
}
```

### With Error Handling
```tsx
function ErrorHandlingSuperAgent() {
  const handleError = (error: Error) => {
    console.error('Failed to load super agent icon:', error)
    // Show toast notification or fallback UI
  }

  return (
    <SuperAgentIcon
      name="invalid_agent"
      size="md"
      variant="red"
      onError={handleError}
    />
  )
}
```

### All Size Variants
```tsx
function AllSizes() {
  return (
    <div className="flex gap-4 items-end">
      <SuperAgentIcon name="super_orchestrator" size="sm" variant="purple" />
      <SuperAgentIcon name="super_orchestrator" size="md" variant="purple" />
      <SuperAgentIcon name="super_orchestrator" size="lg" variant="purple" />
      <SuperAgentIcon name="super_orchestrator" size="xl" variant="purple" />
      <SuperAgentIcon name="super_orchestrator" size="2xl" variant="purple" />
    </div>
  )
}
```

---

## Icon Examples

### Basic Usage
```tsx
import { Icon } from '@vital/ui'

function BasicIcon() {
  return (
    <Icon
      name="analytics_chart"
      variant="purple"
      size="md"
    />
  )
}
```

### Black vs Purple Variants
```tsx
function IconVariants() {
  return (
    <div className="flex gap-4">
      <Icon name="workflow_node" variant="black" size="lg" />
      <Icon name="workflow_node" variant="purple" size="lg" />
    </div>
  )
}
```

### In Navigation
```tsx
function NavigationWithIcons() {
  return (
    <nav className="flex gap-6">
      <button className="flex items-center gap-2">
        <Icon name="navigation_home" variant="black" size="sm" />
        <span>Home</span>
      </button>
      <button className="flex items-center gap-2">
        <Icon name="navigation_search" variant="black" size="sm" />
        <span>Search</span>
      </button>
      <button className="flex items-center gap-2">
        <Icon name="navigation_menu" variant="black" size="sm" />
        <span>Menu</span>
      </button>
    </nav>
  )
}
```

### With Custom Color Filter
```tsx
function CustomColorIcon() {
  return (
    <Icon
      name="medical_heart"
      variant="purple"
      size="lg"
      customColor="#EF4444" // Apply red filter
    />
  )
}
```

---

## AgentAvatar Examples

### Basic Usage
```tsx
import { AgentAvatar } from '@vital/ui'

function BasicAvatar() {
  return (
    <AgentAvatar
      personaType="expert"
      department="medical_affairs"
      variant={1}
      tier={2}
      size="lg"
    />
  )
}
```

### With Name Badge
```tsx
function AvatarWithName() {
  return (
    <AgentAvatar
      personaType="pharma"
      department="market_access"
      variant={5}
      tier={2}
      size="xl"
      showName={true}
      name="Dr. Sarah Chen"
      badgeColor="#0046FF"
    />
  )
}
```

### All Tier Styles
```tsx
function AllTiers() {
  return (
    <div className="flex gap-6">
      {[1, 2, 3, 4, 5].map((tier) => (
        <AgentAvatar
          key={tier}
          personaType="expert"
          department="medical_affairs"
          variant={1}
          tier={tier as AgentTier}
          size="lg"
          showName={true}
          name={`Tier ${tier}`}
        />
      ))}
    </div>
  )
}
```

### Direct Avatar Filename
```tsx
function DirectAvatar() {
  return (
    <AgentAvatar
      avatar="/assets/vital/avatars/vital_avatar_medical_product_innovation_15.svg"
      tier={2}
      size="lg"
      name="Product Innovation Specialist"
    />
  )
}
```

### In Agent Card
```tsx
function AgentCard() {
  const agent = {
    name: "Dr. Michael Rodriguez",
    personaType: "medical" as const,
    department: "medical_affairs" as const,
    tier: 2 as const,
    description: "Clinical trials expert with 15+ years experience",
  }

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm">
      <div className="flex items-center gap-4">
        <AgentAvatar
          personaType={agent.personaType}
          department={agent.department}
          variant={3}
          tier={agent.tier}
          size="xl"
          badgeColor="#EF4444"
        />
        <div>
          <h3 className="font-semibold text-lg">{agent.name}</h3>
          <p className="text-sm text-gray-600">{agent.description}</p>
        </div>
      </div>
    </div>
  )
}
```

---

## IconPicker Examples

### Basic Usage
```tsx
import { IconPicker } from '@vital/ui'
import { useState } from 'react'

function BasicIconPicker() {
  const [selectedIcon, setSelectedIcon] = useState('')

  return (
    <IconPicker
      onSelect={setSelectedIcon}
      selectedIcon={selectedIcon}
      variant="both"
    />
  )
}
```

### Purple Only
```tsx
function PurpleIconPicker() {
  const [selectedIcon, setSelectedIcon] = useState('')

  return (
    <IconPicker
      onSelect={setSelectedIcon}
      selectedIcon={selectedIcon}
      variant="purple"
      maxHeight="500px"
    />
  )
}
```

### With Custom Categories
```tsx
function CustomCategoriesIconPicker() {
  const [selectedIcon, setSelectedIcon] = useState('')

  return (
    <IconPicker
      onSelect={setSelectedIcon}
      selectedIcon={selectedIcon}
      variant="both"
      categories={["analytics", "workflow", "medical"]}
      maxHeight="400px"
    />
  )
}
```

### In Modal
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@vital/ui'

function IconPickerModal() {
  const [open, setOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState('')

  const handleSelect = (iconName: string) => {
    setSelectedIcon(iconName)
    setOpen(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Select Icon
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose an Icon</DialogTitle>
          </DialogHeader>
          <IconPicker
            onSelect={handleSelect}
            selectedIcon={selectedIcon}
            variant="both"
            maxHeight="600px"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

## AvatarGrid Examples

### Basic Usage
```tsx
import { AvatarGrid } from '@vital/ui'
import { useState } from 'react'

function BasicAvatarGrid() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  return (
    <AvatarGrid
      onSelect={setSelectedAvatar}
      selectedAvatar={selectedAvatar}
      tier={2}
    />
  )
}
```

### Filtered by Persona
```tsx
function PersonaFilteredGrid() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  return (
    <AvatarGrid
      onSelect={setSelectedAvatar}
      selectedAvatar={selectedAvatar}
      tier={2}
      personaType="expert"
      maxHeight="700px"
    />
  )
}
```

### Filtered by Department
```tsx
function DepartmentFilteredGrid() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  return (
    <AvatarGrid
      onSelect={setSelectedAvatar}
      selectedAvatar={selectedAvatar}
      tier={2}
      department="medical_affairs"
      columns={8}
    />
  )
}
```

### In Settings Panel
```tsx
function AvatarSettings() {
  const [selectedAvatar, setSelectedAvatar] = useState('')

  return (
    <div className="p-6 bg-white rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Choose Your Avatar</h2>
      <AvatarGrid
        onSelect={setSelectedAvatar}
        selectedAvatar={selectedAvatar}
        tier={2}
        maxHeight="500px"
        columns={6}
        showDetails={true}
      />
      {selectedAvatar && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-900">
            Selected: <code className="font-mono">{selectedAvatar}</code>
          </p>
        </div>
      )}
    </div>
  )
}
```

---

## Real-World Integration Examples

### Agent Profile Page
```tsx
import { AgentAvatar, Icon } from '@vital/ui'

function AgentProfilePage() {
  const agent = {
    id: "agent-123",
    name: "Dr. Emily Watson",
    personaType: "medical" as const,
    department: "medical_affairs" as const,
    tier: 2 as const,
    specialties: ["Clinical Trials", "Regulatory Affairs"],
    experience: "15+ years",
    rating: 4.9,
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8">
          <div className="flex items-center gap-6">
            <AgentAvatar
              personaType={agent.personaType}
              department={agent.department}
              variant={1}
              tier={agent.tier}
              size="2xl"
              badgeColor="#EF4444"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-gray-600 mt-1">{agent.experience} experience</p>
              <div className="flex items-center gap-2 mt-2">
                <Icon name="status_active" variant="purple" size="sm" />
                <span className="text-sm text-purple-700 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4">Specialties</h2>
          <div className="flex gap-2">
            {agent.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Agent Directory Grid
```tsx
import { AgentAvatar, Icon } from '@vital/ui'

function AgentDirectory() {
  const agents = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      personaType: "expert" as const,
      department: "medical_affairs" as const,
      tier: 2 as const,
    },
    {
      id: "2",
      name: "Michael Rodriguez",
      personaType: "pharma" as const,
      department: "market_access" as const,
      tier: 2 as const,
    },
    // ... more agents
  ]

  return (
    <div className="grid grid-cols-3 gap-6 p-8">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div className="flex flex-col items-center">
            <AgentAvatar
              personaType={agent.personaType}
              department={agent.department}
              variant={1}
              tier={agent.tier}
              size="xl"
              showName={false}
            />
            <h3 className="mt-4 font-semibold text-center">{agent.name}</h3>
            <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Icon name="action_play" variant="black" size="sm" />
              <span>Start Chat</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Dashboard Header
```tsx
import { SuperAgentIcon, Icon } from '@vital/ui'

function DashboardHeader() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <SuperAgentIcon
              name="super_orchestrator"
              size="sm"
              variant="purple"
            />
            <h1 className="text-xl font-bold">VITAL Platform</h1>
          </div>

          {/* Navigation */}
          <nav className="flex gap-6">
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Icon name="analytics_dashboard" variant="black" size="sm" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Icon name="collaboration_team" variant="black" size="sm" />
              <span>Agents</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Icon name="workflow_canvas" variant="black" size="sm" />
              <span>Workflows</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
```

### Agent Creation Form
```tsx
import { IconPicker, AvatarGrid } from '@vital/ui'
import { useState } from 'react'

function AgentCreationForm() {
  const [selectedIcon, setSelectedIcon] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [step, setStep] = useState<'icon' | 'avatar'>('icon')

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg border shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Create New Agent</h2>

        {/* Step Indicator */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setStep('icon')}
            className={`px-4 py-2 rounded-lg ${
              step === 'icon' ? 'bg-purple-600 text-white' : 'bg-gray-100'
            }`}
          >
            1. Choose Icon
          </button>
          <button
            onClick={() => setStep('avatar')}
            className={`px-4 py-2 rounded-lg ${
              step === 'avatar' ? 'bg-purple-600 text-white' : 'bg-gray-100'
            }`}
          >
            2. Choose Avatar
          </button>
        </div>

        {/* Content */}
        {step === 'icon' && (
          <IconPicker
            onSelect={setSelectedIcon}
            selectedIcon={selectedIcon}
            variant="purple"
            maxHeight="500px"
          />
        )}

        {step === 'avatar' && (
          <AvatarGrid
            onSelect={setSelectedAvatar}
            selectedAvatar={selectedAvatar}
            tier={2}
            maxHeight="500px"
            columns={6}
          />
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button className="px-6 py-2 border rounded-lg">Cancel</button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg">
            {step === 'icon' ? 'Next' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Performance Best Practices

### Lazy Loading
```tsx
// Avatars lazy load by default
<AgentAvatar
  personaType="expert"
  department="medical_affairs"
  variant={1}
  tier={2}
  size="lg"
  lazy={true} // Default
/>
```

### Preloading Critical Icons
```tsx
useEffect(() => {
  // Preload critical icons
  const criticalIcons = [
    'navigation_home',
    'navigation_search',
    'navigation_menu',
  ]

  criticalIcons.forEach(iconName => {
    const img = new Image()
    img.src = `/assets/vital/icons/black/${iconName}.svg`
  })
}, [])
```

### Memoization
```tsx
import { memo } from 'react'

const MemoizedAgentAvatar = memo(AgentAvatar)

function AgentList({ agents }) {
  return agents.map(agent => (
    <MemoizedAgentAvatar
      key={agent.id}
      personaType={agent.personaType}
      department={agent.department}
      variant={agent.variant}
      tier={agent.tier}
      size="md"
    />
  ))
}
```

---

## Accessibility

### Alt Text
```tsx
// Always provide descriptive names
<AgentAvatar
  personaType="expert"
  department="medical_affairs"
  variant={1}
  tier={2}
  size="lg"
  name="Dr. Sarah Chen - Medical Affairs Expert" // Descriptive alt text
/>
```

### Keyboard Navigation
```tsx
// Icon picker supports keyboard navigation automatically
<IconPicker
  onSelect={handleSelect}
  selectedIcon={selectedIcon}
  variant="both"
/>
```

### ARIA Labels
```tsx
<button aria-label="Select agent avatar">
  <AgentAvatar
    personaType="expert"
    department="medical_affairs"
    variant={1}
    tier={2}
    size="md"
  />
</button>
```
