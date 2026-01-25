
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';


const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('profileActiveTab') || '0';
  });
  const [notifications, setNotifications] = useState({ email: user?.notifications?.email ?? true, sms: user?.notifications?.sms ?? false });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    localStorage.setItem('profileActiveTab', activeTab);
  }, [activeTab]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setMobile(user?.mobile || '');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        firstName,
        lastName,
        mobile,
      });
      setIsEditing(false);
    } catch (error: any) {
      // Error already handled in useAuth
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  const handleNotificationChange = async (type: 'email' | 'sms', value: boolean) => {
    setIsSavingNotifications(true);

    try {
      if (type === 'email') {
        setNotifications((prev) => ({ ...prev, email: value }));
      } else {
        setNotifications((prev) => ({ ...prev, sms: value }));
      }

      await updateProfile({
        notifications: {
          email: type === 'email' ? value : notifications.email,
          sms: type === 'sms' ? value : notifications.sms,
        },
      });
    } catch (error: any) {
      // Revert on error
      if (type === 'email') {
        setNotifications((prev) => ({ ...prev, email: !value }));
      } else {
        setNotifications((prev) => ({ ...prev, sms: !value }));
      }
      // Error already handled in useAuth
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-8 text-center"
          >
            My Profile
          </motion.h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="0">Profile</TabsTrigger>
              <TabsTrigger value="1">My Courses</TabsTrigger>
              <TabsTrigger value="2">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatar} alt={getFullName()} />
                        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle>{getFullName()}</CardTitle>
                        <CardDescription>{user?.email}</CardDescription>
                      </div>
                      {!isEditing && (
                        <Button variant="outline" onClick={handleEditClick}>
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="mobile"
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 1234567890"
                            disabled={!isEditing}
                          />
                        </div>
                        {user?.isVerified ? (
                          <p className="text-xs text-green-500">Verified</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Phone verification required for secure access</p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>My Enrolled Courses</CardTitle>
                    <CardDescription>
                      Courses you've enrolled in or purchased
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                      <Button asChild>
                        <a href="/courses">Browse Courses</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Password</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Change your password with OTP verification
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/change-password')}
                      >
                        Change Password
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Notifications</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive emails about course updates
                            </p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={notifications.email}
                            onCheckedChange={(value) => handleNotificationChange('email', value)}
                            disabled={isSavingNotifications}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive text messages about course updates
                            </p>
                          </div>
                          <Switch
                            id="smsNotifications"
                            checked={notifications.sms}
                            onCheckedChange={(value) => handleNotificationChange('sms', value)}
                            disabled={isSavingNotifications}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Account</h3>
                      <Button variant="destructive" onClick={logout}>
                        Log Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
