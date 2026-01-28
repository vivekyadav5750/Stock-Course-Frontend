import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');
  const { user, login, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/courses');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/courses');
    } catch (error: any) {
      console.log("error", error);
      console.error('Login error:', error);
      
      // Check if error is due to unverified email
      const errorMessage = error || '';
      if (
        errorMessage.toLowerCase().includes('verify') ||
        errorMessage.toLowerCase().includes('not verified')
      ) {
        setError('Your email is not verified. Please verify to continue.');
        setNeedsVerification(true);
        
        // Automatically send OTP
        try {
          await sendOTP(email, 'signup');
          toast.success('Verification code sent to your email!');
        } catch (otpError) {
          console.error('Failed to send OTP:', otpError);
        }
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verifyOTP(email, otp, 'signup');
      
      toast.success('Email verified successfully! Logging you in...');
      setNeedsVerification(false);
      setOtp('');
      
      // Automatically attempt login
      try {
        await login(email, password);
        navigate('/courses');
      } catch (loginError) {
        toast.info('Please login with your credentials.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to verify OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await sendOTP(email, 'signup');
      toast.success('Verification code resent to your email!');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to resend verification code.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center">
      <div className="container px-4 mx-auto">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  {needsVerification ? "Verify Your Email" : "Welcome back"}
                </CardTitle>
                <CardDescription>
                  {needsVerification 
                    ? "Enter the OTP code sent to your email to activate your account"
                    : "Enter your credentials to access your account"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant={needsVerification ? "default" : "destructive"} className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!needsVerification ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">OTP Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                      />
                      <p className="text-sm text-gray-500">
                        Verification code sent to {email}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Your account will be activated after verification
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setNeedsVerification(false);
                        setOtp('');
                        setError('');
                      }}
                      disabled={isLoading}
                    >
                      Back to Login
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
