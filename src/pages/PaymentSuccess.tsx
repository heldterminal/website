import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Refresh the user's profile to get updated plan status
    refreshProfile();

    // Countdown and close tab
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshProfile]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <Crown className="h-16 w-16 text-primary mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to Pro! 🎉
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Your subscription has been activated successfully. You now have access to all Pro features!
        </p>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-primary mb-2">Pro Features Unlocked:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 20,000 tokens per month</li>
            <li>• Multiple AI models</li>
            <li>• Advanced analytics</li>
            <li>• Team knowledge sharing</li>
            <li>• Custom runbooks</li>
            <li>• Priority support</li>
            <li>• API access</li>
          </ul>
        </div>
        
        <p className="text-sm text-muted-foreground">
          This tab will close automatically in {countdown} seconds...
        </p>
        
        <button
          onClick={() => window.close()}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Close Now
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
