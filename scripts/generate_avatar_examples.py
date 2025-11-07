#!/usr/bin/env python3
"""
Generate avatar URLs for all agents using different avatar systems
"""

import json

# Avatar generator functions
def dicebear_avataaars(name, category=None):
    """DiceBear Avataaars style"""
    seed = name.replace(' ', '-')
    base = f"https://api.dicebear.com/7.x/avataaars/svg?seed={seed}"
    
    if category:
        colors = {
            'medical_affairs': 'b6e3f4',
            'regulatory': 'e9d5ff',
            'market_access': 'bbf7d0',
            'clinical': 'cffafe',
            'marketing': 'fecaca',
            'technical': 'fed7aa',
            'analytical': 'fef3c7'
        }
        bg = colors.get(category, 'e5e7eb')
        return f"{base}&backgroundColor={bg}"
    return base

def dicebear_bottts(name):
    """DiceBear Bottts (Robot/AI style)"""
    seed = name.replace(' ', '-')
    return f"https://api.dicebear.com/7.x/bottts/svg?seed={seed}"

def boring_avatars_beam(name, category=None):
    """Boring Avatars - Beam style"""
    colors_by_category = {
        'medical_affairs': '2563eb,60a5fa,3b82f6,1d4ed8,1e40af',
        'regulatory': '7c3aed,a78bfa,8b5cf6,6d28d9,5b21b6',
        'market_access': '059669,34d399,10b981,047857,065f46',
        'clinical': '0891b2,22d3ee,06b6d4,0e7490,155e75',
        'marketing': 'dc2626,f87171,ef4444,b91c1c,991b1b',
        'technical': 'ea580c,fb923c,f97316,c2410c,9a3412',
        'analytical': 'ca8a04,fbbf24,f59e0b,b45309,92400e'
    }
    
    colors = colors_by_category.get(category, '6b7280,9ca3af,6b7280,4b5563,374151')
    encoded_name = name.replace(' ', '%20')
    return f"https://source.boringavatars.com/beam/120/{encoded_name}?colors={colors}"

def boring_avatars_bauhaus(name, category=None):
    """Boring Avatars - Bauhaus style"""
    colors_by_category = {
        'medical_affairs': '2563eb,60a5fa,3b82f6,1d4ed8',
        'regulatory': '7c3aed,a78bfa,8b5cf6,6d28d9',
        'market_access': '059669,34d399,10b981,047857',
        'clinical': '0891b2,22d3ee,06b6d4,0e7490',
        'marketing': 'dc2626,f87171,ef4444,b91c1c',
        'technical': 'ea580c,fb923c,f97316,c2410c',
        'analytical': 'ca8a04,fbbf24,f59e0b,b45309'
    }
    
    colors = colors_by_category.get(category, '6b7280,9ca3af,6b7280,4b5563')
    encoded_name = name.replace(' ', '%20')
    return f"https://source.boringavatars.com/bauhaus/120/{encoded_name}?colors={colors}"

def gradient_initials_url(name, category=None):
    """Gradient with initials (custom endpoint)"""
    initials = ''.join([word[0] for word in name.split()[:2]]).upper()
    
    gradients = {
        'medical_affairs': 'blue',
        'regulatory': 'purple',
        'market_access': 'green',
        'clinical': 'cyan',
        'marketing': 'red',
        'technical': 'orange',
        'analytical': 'yellow'
    }
    
    gradient = gradients.get(category, 'gray')
    return f"/api/avatar/gradient?initials={initials}&color={gradient}"

# Sample agents by category
sample_agents = [
    ("Medical Science Liaison Advisor", "medical_affairs"),
    ("HEOR Director", "market_access"),
    ("Regulatory Strategy Advisor", "regulatory"),
    ("Clinical Data Manager", "clinical"),
    ("Brand Strategy Director", "marketing"),
    ("AI/ML Model Validator", "technical"),
    ("Real World Data Analyst", "analytical"),
]

print("=" * 100)
print("🎨 AVATAR SYSTEM COMPARISON - Professional Options for VITAL Agents")
print("=" * 100)
print()

for name, category in sample_agents:
    print(f"\n{'=' * 100}")
    print(f"Agent: {name} ({category.replace('_', ' ').title()})")
    print(f"{'=' * 100}\n")
    
    print("1️⃣  DiceBear Avataaars (Cartoon Professional)")
    print(f"   {dicebear_avataaars(name, category)}")
    print()
    
    print("2️⃣  DiceBear Bottts (Robot/AI Style)")
    print(f"   {dicebear_bottts(name)}")
    print()
    
    print("3️⃣  Boring Avatars - Beam (Abstract Professional) ⭐ RECOMMENDED")
    print(f"   {boring_avatars_beam(name, category)}")
    print()
    
    print("4️⃣  Boring Avatars - Bauhaus (Colorful Geometric)")
    print(f"   {boring_avatars_bauhaus(name, category)}")
    print()
    
    print("5️⃣  Gradient Initials (Custom - Most Professional)")
    print(f"   {gradient_initials_url(name, category)}")
    print()

print("\n" + "=" * 100)
print("📊 COMPARISON SUMMARY")
print("=" * 100)
print()
print("✅ MOST PROFESSIONAL: Boring Avatars Beam + Category Colors")
print("✅ MOST UNIQUE:       DiceBear Avataaars with Category Backgrounds")
print("✅ MOST AI-THEMED:    DiceBear Bottts (Robot style)")
print("✅ MOST ENTERPRISE:   Gradient Initials (requires custom endpoint)")
print()
print("💡 RECOMMENDATION:")
print("   Use Boring Avatars Beam with category-specific color palettes")
print("   - Free, unlimited usage")
print("   - Professional abstract design")
print("   - Category differentiation through colors")
print("   - No gender/race bias")
print("   - Beautiful, modern aesthetic")
print()
print("=" * 100)

