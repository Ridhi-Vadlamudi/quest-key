import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (isPasswordless) {
          // Send OTP for login
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false
            }
          });
          
          if (error) throw error;
          
          toast({
            title: "Check your email!",
            description: "We've sent you a login code.",
          });
          
          setShowVerification(true);
        } else {
          // Regular password login
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          
          navigate("/dashboard");
        }
      } else {
        // Sign up with OTP only (no password)
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email!",
          description: "We've sent you a verification code to create your StudyHelp account.",
        });
        
        setShowVerification(true);
        setIsPasswordless(true); // Set to passwordless after signup
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: !isLogin // Only create user if signing up
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Code resent!",
        description: "We've sent a new verification code to your email.",
      });
      
      setVerificationCode("");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: isLogin ? "You've been signed in." : "Your StudyHelp account has been created!",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {showVerification 
              ? "Verify Your Email" 
              : (isLogin ? "Sign In" : "Create Account")
            }
          </CardTitle>
          <p className="text-muted-foreground">
            {showVerification 
              ? `Enter the verification code sent to ${email}`
              : (isLogin 
                ? "Welcome back to StudyHelp" 
                : "Join StudyHelp with just your email - no password needed!"
              )
            }
          </p>
        </CardHeader>
        <CardContent>
          {showVerification ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Account"}
              </Button>
              
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="w-full"
                >
                  {resending ? "Resending..." : "Resend Code"}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {setShowVerification(false); setVerificationCode("");}}
                  className="w-full text-sm"
                >
                  Back to Sign Up
                </Button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                {(isLogin && !isPasswordless) && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading 
                    ? "Please wait..." 
                    : (isLogin 
                      ? (isPasswordless ? "Send Login Code" : "Sign In") 
                      : "Send Verification Code"
                    )
                  }
                </Button>
              </form>
              
              <div className="mt-4 text-center space-y-2">
                {isLogin && !isPasswordless && (
                  <Button
                    variant="link"
                    onClick={() => setIsPasswordless(true)}
                    className="text-sm w-full"
                  >
                    Sign in with email code instead
                  </Button>
                )}
                
                {isLogin && isPasswordless && (
                  <Button
                    variant="link"
                    onClick={() => setIsPasswordless(false)}
                    className="text-sm w-full"
                  >
                    Sign in with password instead
                  </Button>
                )}
                
                <Button
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setIsPasswordless(false);
                    setPassword("");
                  }}
                  className="text-sm w-full"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;