'use client'

import { useAuth } from '@/lib/auth/supabase-auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Building2,
  Shield,
  Calendar,
  Settings,
  Bell,
  Key
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, userProfile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U'

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown'

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || 'User'} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {userProfile?.full_name || 'User'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    {userProfile?.role || 'User'}
                  </Badge>
                  {userProfile?.tenant_id && (
                    <Badge variant="outline">
                      <Building2 className="mr-1 h-3 w-3" />
                      Tenant: {userProfile.tenant_id.substring(0, 8)}...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{userProfile?.full_name || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{userProfile?.role || 'User'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {createdAt}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{user.id}</p>
            </div>

            {userProfile?.tenant_id && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tenant ID</p>
                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{userProfile.tenant_id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/settings#notifications">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/settings#security">
                  <Key className="h-5 w-5" />
                  <span>Security</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
