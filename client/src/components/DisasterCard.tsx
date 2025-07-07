'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Disaster } from "@/types/disaster.types";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type Props = {
  disaster: Disaster;
};

export function DisasterCard({ disaster }: Props) {
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    const formatted = new Date(disaster.created_at).toLocaleString();
    setCreatedAt(formatted);
  }, [disaster.created_at]);

  return (
    <Card className="rounded-2xl shadow-md border">
      <CardContent className="p-4 space-y-2">
        <h2 className="text-xl font-semibold">{disaster.title}</h2>
        <p className="text-sm text-muted-foreground">{disaster.description}</p>
        <p className="text-sm font-medium">📍 {disaster.location_name}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {disaster.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
        {createdAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Created at: {createdAt}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
