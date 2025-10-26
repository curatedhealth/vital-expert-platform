'use client';

import { Stethoscope, FileText, Search, BarChart3, Wrench } from 'lucide-react';
import * as React from 'react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@vital/ui';

interface NavRagCategoriesProps {
  onCategoryClick: (category: string) => void;
}

const categories = [
  { id: 'clinical', title: 'Clinical', icon: Stethoscope },
  { id: 'regulatory', title: 'Regulatory', icon: FileText },
  { id: 'research', title: 'Research', icon: Search },
  { id: 'reimbursement', title: 'Reimbursement', icon: BarChart3 },
  { id: 'technology', title: 'Technology', icon: Wrench },
];

export function NavRagCategories({ onCategoryClick }: NavRagCategoriesProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>RAG Categories</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories.map((category) => (
            <SidebarMenuItem key={category.id}>
              <SidebarMenuButton onClick={() => onCategoryClick(category.id)}>
                <category.icon className="mr-3 h-4 w-4" />
                {category.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}