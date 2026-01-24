import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getErrorMessage } from "@/lib/utils";

type Step = "register" | "otp" | "success";

export default function Register() {
  const navigate = useNavigate();
  const { register, sendOTP, verifyOTP } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("register");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await register(firstName, lastName, email, password, mobile || undefined);
      
      await sendOTP(email, "signup");
      
      toast.success("Account created! Verification code sent to your email.");
      setCurrentStep("otp");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to create account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyOTP(email, otp, "signup");
      
      toast.success("Account activated! You can now login.");
      setCurrentStep("success");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to verify OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await sendOTP(email, "signup");
      toast.success("Verification code resent to your email!");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to resend verification code."));
    } finally {
      setLoading(false);
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
                  {currentStep === "register" && "Create an account"}
                  {currentStep === "otp" && "Verify Your Email"}
                  {currentStep === "success" && "Account Activated"}
                </CardTitle>
                <CardDescription>
                  {currentStep === "register" && "Enter your details to create your account"}
                  {currentStep === "otp" && "Enter the OTP to activate your account"}
                  {currentStep === "success" && "Your account has been verified and activated"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {currentStep === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="mobile">Mobile (Optional)</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="+1234567890"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Account will be blocked until email verification
                    </p>
                  </form>
                )}

                {currentStep === "otp" && (
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
                        ⚠️ Your account will be activated only after verification
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying & Activating...
                        </>
                      ) : (
                        "Verify & Activate Account"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      Resend OTP
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep("register")}
                      disabled={loading}
                    >
                      Back to Registration
                    </Button>
                  </form>
                )}

                {currentStep === "success" && (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <p className="text-gray-600">
                      Your email has been verified and your account is now active! You can now login with your credentials.
                    </p>
                    <Button onClick={() => navigate("/login")} className="w-full">
                      Go to Login
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                {currentStep !== "success" && (
                  <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Login
                    </Link>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
