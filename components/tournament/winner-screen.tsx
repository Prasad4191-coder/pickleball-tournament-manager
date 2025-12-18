'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Team, Match, SemifinalMatch } from '@/app/page';
import TournamentStandings from './tournament-standings';
import { useState } from 'react';

interface WinnerScreenProps {
  champion: Team;
  onReset: () => void;
  onAddTeam: () => void;
  onShuffleTeams: () => void;
  teams: Team[];
  matches: Match[];
  teamCount: number;
  semifinalMatch?: any;
  semifinalMatches?: SemifinalMatch[];
  finalMatch?: any;
}

export default function WinnerScreen({
  champion,
  onReset,
  onAddTeam,
  onShuffleTeams,
  teams,
  matches,
  teamCount,
  semifinalMatch,
  semifinalMatches,
  finalMatch,
}: WinnerScreenProps) {
  const [showStandings, setShowStandings] = useState(false);

  return (
    <div className="space-y-6">
      {!showStandings ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-6 max-w-md w-full">
            <div className="text-6xl animate-bounce">🏆</div>

            <Card className="border-2 border-yellow-400 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-3xl text-yellow-700">Champion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-green-700">{champion.teamName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {champion.players[0]} & {champion.players[1]}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">Congratulations on your victory!</p>
              <p className="text-sm text-gray-600">You have won the Pickleball Tournament!</p>
            </div>

            {finalMatch && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-base text-green-800">Final Match Result</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className={finalMatch.winner === finalMatch.team1 ? 'font-bold' : ''}>
                      {finalMatch.team1Name}
                    </span>
                    <span className="font-mono font-bold mx-2">
                      {finalMatch.score.t1} - {finalMatch.score.t2}
                    </span>
                    <span className={finalMatch.winner === finalMatch.team2 ? 'font-bold' : ''}>
                      {finalMatch.team2Name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {semifinalMatches && semifinalMatches.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-base text-blue-800">Semifinal Results</CardTitle>
                </CardHeader>
                <CardContent className="pb-3 space-y-2">
                  {semifinalMatches.map((match) => (
                    <div key={match.id} className="flex justify-between items-center text-sm">
                      <span className={match.winner === match.team1 ? 'font-bold' : ''}>
                        {match.team1Name}
                      </span>
                      <span className="font-mono font-bold mx-2">
                        {match.score.t1} - {match.score.t2}
                      </span>
                      <span className={match.winner === match.team2 ? 'font-bold' : ''}>
                        {match.team2Name}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {semifinalMatch && !semifinalMatches?.length && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-base text-blue-800">Semifinal Match Result</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className={semifinalMatch.winner === semifinalMatch.team1 ? 'font-bold' : ''}>
                      {semifinalMatch.team1Name}
                    </span>
                    <span className="font-mono font-bold mx-2">
                      {semifinalMatch.score.t1} - {semifinalMatch.score.t2}
                    </span>
                    <span className={semifinalMatch.winner === semifinalMatch.team2 ? 'font-bold' : ''}>
                      {semifinalMatch.team2Name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Button
                onClick={() => setShowStandings(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
              >
                View Full Standings
              </Button>

              <Button
                onClick={onReset}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
              >
                Start New Tournament (Same Teams)
              </Button>

              <Button
                onClick={onAddTeam}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12"
              >
                Add New Team & Restart
              </Button>

              <Button
                onClick={onShuffleTeams}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12"
              >
                Shuffle Players & Restart
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={() => setShowStandings(false)}
            variant="outline"
            className="mb-4"
          >
            ← Back to Champion
          </Button>

          <TournamentStandings
            teams={teams}
            matches={matches}
            champion={champion}
            teamCount={teamCount}
            semifinalMatch={semifinalMatch}
            semifinalMatches={semifinalMatches}
            finalMatch={finalMatch}
          />

          <Button
            onClick={onReset}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
          >
            Start New Tournament (Same Teams)
          </Button>

          <Button
            onClick={onAddTeam}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12"
          >
            Add New Team & Restart
          </Button>

          <Button
            onClick={onShuffleTeams}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12"
          >
            Shuffle Players & Restart
          </Button>
        </div>
      )}
    </div>
  );
}
