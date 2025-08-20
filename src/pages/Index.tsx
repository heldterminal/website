const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-white flex items-center justify-center p-8">
      <div className="text-center space-y-12 max-w-2xl mx-auto">
        {/* Main content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-light tracking-tight text-foreground">
              White
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              A beautifully minimal space that does nothing
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="flex justify-center">
            <div className="w-px h-24 bg-border"></div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 transition-all duration-300 hover:shadow-gentle">
              <p className="text-muted-foreground text-sm">
                Sometimes the most beautiful things are the simplest
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-muted animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;