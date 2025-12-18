'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeamSelectionScreenProps {
  onSelectTeamCount: (count: number) => void;
  onViewHistory: () => void;
}

export default function TeamSelectionScreen({
  onSelectTeamCount,
  onViewHistory,
}: TeamSelectionScreenProps) {
  const teamOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-700">Pickleball</CardTitle>
          <CardTitle className="text-2xl mb-2">Tournament Manager</CardTitle>
          <CardDescription className="text-base mt-4">
            How many teams are playing today?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {teamOptions.map((count) => (
              <Button
                key={count}
                onClick={() => onSelectTeamCount(count)}
                className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {count}
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={onViewHistory}
              className="w-full text-green-700 border-green-200 hover:bg-green-50"
            >
              View Tournament History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
