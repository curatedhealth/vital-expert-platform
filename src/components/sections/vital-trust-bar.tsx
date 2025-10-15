'use client';

export function VitalTrustBar() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Building the Future of Healthcare Innovation
          </h2>
          <p className="text-muted-foreground mb-8">
            Designed for healthcare teams who need expert-level support
          </p>
          
          {/* Placeholder for partner logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Partner 1</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Partner 2</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Partner 3</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Partner 4</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Partner 5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
