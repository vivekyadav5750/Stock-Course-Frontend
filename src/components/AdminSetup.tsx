
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const makeAdmin = async () => {
    if (!user || !session) {
      toast.error('You must be logged in to set up admin access');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('make-admin', {
        body: { force: true }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Admin access granted. Please refresh the page.');
        
        // Force page reload after a short delay to refresh auth state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.info(data?.message || 'No changes were made');
      }
    } catch (error: any) {
      console.error('Error setting up admin:', error);
      toast.error(error.message || 'Failed to set up admin access');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-4 right-4 z-50 max-w-md"
    >
      <Card className="border shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Admin Setup</CardTitle>
          <CardDescription>
            Make your account an admin to manage courses
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">
            You need admin permissions to create and manage courses. Click below to grant admin access to your account.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={makeAdmin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Setting up..." : "Make Me Admin"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AdminSetup;
