"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { clsx } from "clsx";

interface StarGridContextType {
  activeItems: Set<number>;
  featuredItems: Set<number>;
}

const StarGridContext = createContext<StarGridContextType | null>(null);

interface StarGridProps {
  active?: number;
  duration?: number;
  featureDuration?: number;
  className?: string;
  children: React.ReactNode;
}

interface StarGridItemProps {
  className?: string;
  children: (props: { isActive: boolean; isFeatured: boolean }) => React.ReactNode;
  index?: number;
}

export function StarGrid({ active = 0, duration = 100, featureDuration = 1500, className, children }: StarGridProps) {
  const [activeItems, setActiveItems] = useState<Set<number>>(new Set());
  const [featuredItems, setFeaturedItems] = useState<Set<number>>(new Set());

  const activateItems = useCallback(() => {
    const items = React.Children.toArray(children);
    const newActive = new Set<number>();
    const newFeatured = new Set<number>();

    // Activate random items
    const activeCount = Math.min(active, items.length);
    const indices = Array.from({ length: items.length }, (_, i) => i);
    
    // Shuffle and select active items
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (let i = 0; i < activeCount; i++) {
      newActive.add(indices[i]);
    }

    // Select a few featured items
    const featuredCount = Math.min(3, activeCount);
    for (let i = 0; i < featuredCount; i++) {
      newFeatured.add(indices[i]);
    }

    setActiveItems(newActive);
    setFeaturedItems(newFeatured);
  }, [active, children]);

  useEffect(() => {
    activateItems();
    const interval = setInterval(activateItems, duration);
    return () => clearInterval(interval);
  }, [activateItems, duration]);

  return (
    <StarGridContext.Provider value={{ activeItems, featuredItems }}>
      <div className={className}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { index } as any);
          }
          return child;
        })}
      </div>
    </StarGridContext.Provider>
  );
}

StarGrid.Item = function StarGridItem({ 
  className, 
  children,
  index = 0,
}: StarGridItemProps) {
  const context = useContext(StarGridContext);
  const isActive = context?.activeItems.has(index) ?? false;
  const isFeatured = context?.featuredItems.has(index) ?? false;

  return <div className={className}>{children({ isActive, isFeatured })}</div>;
};