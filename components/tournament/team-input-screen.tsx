'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team } from '@/app/page';

interface TeamInputScreenProps {
  teamCount: number;
  onSubmit: (teams: Team[]) => void;
  onBack: () => void;
  initialTeams?: Team[];
}

export default function TeamInputScreen({ teamCount, onSubmit, onBack, initialTeams = [] }: TeamInputScreenProps) {
  const teamIds = Array.from({ length: teamCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const [teamData, setTeamData] = useState<Record<string, Team>>(
    teamIds.reduce(
      (acc, id, index) => {
        const existingTeam = initialTeams[index];
        return {
          ...acc,
          [id]: {
            id,
            teamName: existingTeam?.teamName || '',
            players: existingTeam ? [...existingTeam.players] : ['', ''],
          },
        };
      },
      {}
    )
  );

  const handleTeamNameChange = (teamId: string, name: string) => {
    setTeamData((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        teamName: name,
      },
    }));
  };

  const handlePlayerChange = (teamId: string, playerIndex: number, name: string) => {
    setTeamData((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        players: prev[teamId].players.map((p, i) => (i === playerIndex ? name : p)) as [
          string,
          string,
        ],
      },
    }));
  };

  const handleSubmit = () => {
    const allTeams = Object.values(teamData);
    const allFilled = allTeams.every(
      (t) => t.teamName.trim() && t.players[0].trim() && t.players[1].trim()
    );

    if (!allFilled) {
      alert('Please fill in all team and player names');
      return;
    }

    onSubmit(allTeams);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-green-700">Team Setup</h1>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teamIds.map((teamId) => (
          <Card key={teamId} className="overflow-hidden">
            <CardHeader className="bg-green-100 py-3">
              <CardTitle className="text-lg">Team {teamId}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Team Name</label>
                <Input
                  placeholder="Enter team name"
                  value={teamData[teamId].teamName}
                  onChange={(e) => handleTeamNameChange(teamId, e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Player 1</label>
                <Input
                  placeholder="Enter player name"
                  value={teamData[teamId].players[0]}
                  onChange={(e) => handlePlayerChange(teamId, 0, e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Player 2</label>
                <Input
                  placeholder="Enter player name"
                  value={teamData[teamId].players[1]}
                  onChange={(e) => handlePlayerChange(teamId, 1, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Pickleball Rules</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>• Game to 11 points</p>
          <p>• Must win by 2</p>
          <p>• Only serving team scores</p>
          <p>• 7-0 Mercy Rule: Game ends automatically</p>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
      >
        Generate Matches
      </Button>
    </div>
  );
}
