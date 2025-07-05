import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("auditgpt_user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-4">AuditGPT</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your professional AI assistant for internal audit teams
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/login")}
            className="w-full bg-accent hover:bg-accent/90"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/signup")}
            variant="outline"
            className="w-full"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
