'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team, Match, SemifinalMatch } from '@/app/page';

interface FinalsScreenProps {
  teams: Team[];
  matches: Match[];
  onFinalsComplete: (winner: Team) => void;
  onBack: () => void;
  teamCount: number;
  getRankings: () => Array<{
    team: Team;
    wins: number;
    losses: number;
    pointDiff: number;
    totalPoints: number;
  }>;
  miniGames?: any[];
  onSemifinalSubmit?: (semifinal: any) => void;
  semifinalMatches?: SemifinalMatch[];
  onSemifinalMatchesSubmit?: (matches: SemifinalMatch[]) => void;
  onFinalSubmit?: (final: any) => void;
}

export default function FinalsScreen({
  teams,
  matches,
  onFinalsComplete,
  onBack,
  teamCount,
  getRankings,
  miniGames,
  onSemifinalSubmit,
  semifinalMatches = [],
  onSemifinalMatchesSubmit,
  onFinalSubmit,
}: FinalsScreenProps) {
  const [finalMatch, setFinalMatch] = useState<Match | null>(null);
  const [tempScore, setTempScore] = useState<{ t1: string; t2: string }>({ t1: '', t2: '' });
  const [semiScores, setSemiScores] = useState<Record<number, { t1: string; t2: string }>>({});

  const rankings = getRankings();

  // Initialize 4-team semifinals if needed
  useEffect(() => {
    if (teamCount >= 4 && semifinalMatches.length === 0 && onSemifinalMatchesSubmit) {
      // Create 1v4 and 2v3 matches
      const match1: SemifinalMatch = {
        id: 2001,
        team1: rankings[0].team.id,
        team2: rankings[3].team.id,
        team1Name: rankings[0].team.teamName,
        team2Name: rankings[3].team.teamName,
        score: { t1: 0, t2: 0 },
        winner: null,
        finished: false,
      };
      const match2: SemifinalMatch = {
        id: 2002,
        team1: rankings[1].team.id,
        team2: rankings[2].team.id,
        team1Name: rankings[1].team.teamName,
        team2Name: rankings[2].team.teamName,
        score: { t1: 0, t2: 0 },
        winner: null,
        finished: false,
      };
      onSemifinalMatchesSubmit([match1, match2]);
    }
  }, [teamCount, semifinalMatches.length, rankings, onSemifinalMatchesSubmit]);

  const determineFinalists = () => {
    if (teamCount >= 4) {
      // For 4+ teams, we rely on the semifinal matches
      if (semifinalMatches.length === 2 && semifinalMatches.every(m => m.finished)) {
        const winner1 = teams.find(t => t.id === semifinalMatches[0].winner);
        const winner2 = teams.find(t => t.id === semifinalMatches[1].winner);
        if (winner1 && winner2) {
          return {
            needsSemifinal: false, // Semis are done
            finalist1: winner1,
            finalist2: winner2,
            source: 'semifinals'
          };
        }
      }
      return { needsSemifinal: true };
    }

    if (teamCount === 3) {
      const firstPlaceWins = rankings[0].wins;
      const secondPlaceWins = rankings[1].wins;
      const thirdPlaceWins = rankings[2].wins;

      if (firstPlaceWins === 2 && (secondPlaceWins === 1 || thirdPlaceWins === 1)) {
        // Skip semifinals: 2-win team goes directly to finals with 1-win team
        return {
          needsSemifinal: false,
          finalist1: rankings[0].team,
          finalist2: rankings.find((r) => r.wins === 1)!.team,
          source: 'direct'
        };
      } else if (firstPlaceWins === 1 && secondPlaceWins === 1 && thirdPlaceWins === 1) {
        // All 1-1: Need semifinals
        return {
          needsSemifinal: true,
          semifinalTeam1: rankings[1].team,
          semifinalTeam2: rankings[2].team,
          topSeed: rankings[0].team,
          source: '3-way-tie'
        };
      }
    }

    return null;
  };

  const finalists = determineFinalists();

  // Initialize Final Match
  useEffect(() => {
    if (
      !finalMatch &&
      finalists &&
      !finalists.needsSemifinal &&
      finalists.finalist1 &&
      finalists.finalist2
    ) {
      const newFinalMatch = {
        id: 1000,
        team1: finalists.finalist1.id,
        team2: finalists.finalist2.id,
        team1Name: finalists.finalist1.teamName,
        team2Name: finalists.finalist2.teamName,
        score: { t1: 0, t2: 0 },
        winner: null,
        finished: false,
      };
      onFinalSubmit?.(newFinalMatch);
      setFinalMatch(newFinalMatch);
    }
  }, [finalMatch, finalists, onFinalSubmit]);

  // 4-Team Semifinals View
  if (teamCount >= 4 && finalists?.needsSemifinal) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">Playoffs - Semifinals</h1>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {semifinalMatches.map((match) => (
            <Card key={match.id} className={match.finished ? 'opacity-70 bg-gray-50' : ''}>
              <CardHeader className="bg-green-50 py-3">
                <CardTitle className="text-base">
                  {match.id === 2001 ? 'Semi 1 (1st vs 4th)' : 'Semi 2 (2nd vs 3rd)'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-2 text-sm font-medium text-center">
                  {match.team1Name} vs {match.team2Name}
                </div>
                {match.finished ? (
                  <div className="text-center">
                    <p className="text-green-700 font-bold">
                      Winner: {match.winner === match.team1 ? match.team1Name : match.team2Name}
                    </p>
                    <p className="text-xs text-gray-500">Score: {match.score.t1} - {match.score.t2}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder={match.team1Name}
                        value={semiScores[match.id]?.t1 ?? ''}
                        onChange={(e) => setSemiScores(prev => ({
                          ...prev,
                          [match.id]: { ...prev[match.id], t1: e.target.value }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder={match.team2Name}
                        value={semiScores[match.id]?.t2 ?? ''}
                        onChange={(e) => setSemiScores(prev => ({
                          ...prev,
                          [match.id]: { ...prev[match.id], t2: e.target.value }
                        }))}
                      />
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        const s = semiScores[match.id];
                        if (!s?.t1 || !s?.t2) return;
                        const t1 = parseInt(s.t1);
                        const t2 = parseInt(s.t2);
                        const winnerId = t1 > t2 ? match.team1 : match.team2;

                        const updatedMatches = semifinalMatches.map(m =>
                          m.id === match.id
                            ? { ...m, score: { t1, t2 }, winner: winnerId, finished: true }
                            : m
                        );
                        onSemifinalMatchesSubmit?.(updatedMatches);
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 3-Team Semifinal View (Existing Logic)
  if (teamCount === 3 && !finalMatch && finalists?.needsSemifinal && finalists.source === '3-way-tie') {
    const topSeed = finalists.topSeed!;
    const semifinalTeam1 = finalists.semifinalTeam1!;
    const semifinalTeam2 = finalists.semifinalTeam2!;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">Semifinals</h1>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Tournament Status & Standings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="bg-white p-2 rounded border-2 border-green-300">
              <p className="font-semibold text-green-700 mb-1">
                {topSeed.teamName}
              </p>
              <p className="text-xs">
                Record: 1W-1L | Gets bye to Final (Highest point differential/total points)
              </p>
            </div>

            <p className="text-center text-xs font-semibold text-gray-600">SEMIFINAL MATCH</p>

            <div className="bg-white p-2 rounded border-2 border-purple-300">
              <p className="font-semibold text-purple-700 mb-2">
                {semifinalTeam1.teamName} vs {semifinalTeam2.teamName}
              </p>
              <p className="text-xs text-gray-600 mb-1">{semifinalTeam1.teamName} - Record: 1W-1L</p>
              <p className="text-xs text-gray-600">{semifinalTeam2.teamName} - Record: 1W-1L</p>
              <p className="text-xs text-gray-600 mt-2">Winner advances to Final</p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => {
            const semifinal = {
              id: 999,
              team1: semifinalTeam1.id,
              team2: semifinalTeam2.id,
              team1Name: semifinalTeam1.teamName,
              team2Name: semifinalTeam2.teamName,
              score: { t1: 0, t2: 0 },
              winner: null,
              finished: false,
            };
            onSemifinalSubmit?.(semifinal);
            setFinalMatch(semifinal);
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12"
        >
          Start Semifinal
        </Button>
      </div>
    );
  }

  const getFinalTeams = () => {
    if (
      finalists?.needsSemifinal === false &&
      finalists.finalist1 &&
      finalists.finalist2
    ) {
      // Direct to finals
      return { finalist1: finalists.finalist1, finalist2: finalists.finalist2 };
    }
    if (finalMatch?.id === 1000) {
      // After semifinal (3-team), get winner
      // Note: For 4-team, we handle it in useEffect logic above via finalists
      if (teamCount === 3) {
        const topSeed = rankings[0].team;
        const semifinalWinner = teams.find((t) => t.id === finalMatch.team2)!;
        return { finalist1: topSeed, finalist2: semifinalWinner };
      }
    }
    return null;
  };

  const finalTeams = getFinalTeams();
  const isShowingFinal = finalMatch?.id === 1000 || (finalTeams && !finalists?.needsSemifinal);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          {finalMatch?.id === 999 ? 'Semifinal & Final' : 'Championship Final'}
        </h1>
      </div>

      {/* 3-Team Semifinal Scoring UI */}
      {finalMatch?.id === 999 && (
        <Card>
          <CardHeader className="bg-green-50 py-3">
            <CardTitle className="text-base">
              Semifinal: {finalMatch.team1Name} vs {finalMatch.team2Name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{finalMatch.team1Name}</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Score"
                    value={tempScore.t1}
                    onChange={(e) =>
                      setTempScore((prev) => ({ ...prev, t1: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{finalMatch.team2Name}</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Score"
                    value={tempScore.t2}
                    onChange={(e) =>
                      setTempScore((prev) => ({ ...prev, t2: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (tempScore.t1 === '' || tempScore.t2 === '') {
                    alert('Please enter both scores');
                    return;
                  }
                  const t1Score = parseInt(tempScore.t1);
                  const t2Score = parseInt(tempScore.t2);
                  const semifinalWinner =
                    t1Score > t2Score
                      ? teams.find((t) => t.id === finalMatch.team1)!
                      : teams.find((t) => t.id === finalMatch.team2)!;

                  // Update semifinal match with results
                  const updatedSemifinal = {
                    ...finalMatch,
                    score: { t1: t1Score, t2: t2Score },
                    winner: semifinalWinner.id,
                    finished: true,
                  };
                  onSemifinalSubmit?.(updatedSemifinal);

                  const topSeed = rankings[0].team;
                  const newFinalMatch = {
                    id: 1000,
                    team1: topSeed.id,
                    team2: semifinalWinner.id,
                    team1Name: topSeed.teamName,
                    team2Name: semifinalWinner.teamName,
                    score: { t1: 0, t2: 0 },
                    winner: null,
                    finished: false,
                  };
                  onFinalSubmit?.(newFinalMatch);
                  setFinalMatch(newFinalMatch);
                  setTempScore({ t1: '', t2: '' });
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Submit Semifinal Score
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isShowingFinal && finalTeams && (
        <Card>
          <CardHeader className="bg-yellow-50 py-3">
            <CardTitle className="text-base">
              Final: {finalTeams.finalist1.teamName} vs {finalTeams.finalist2.teamName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {finalTeams.finalist1.teamName}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Score"
                    value={tempScore.t1}
                    onChange={(e) =>
                      setTempScore((prev) => ({ ...prev, t1: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {finalTeams.finalist2.teamName}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Score"
                    value={tempScore.t2}
                    onChange={(e) =>
                      setTempScore((prev) => ({ ...prev, t2: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (tempScore.t1 === '' || tempScore.t2 === '') {
                    alert('Please enter both scores');
                    return;
                  }
                  const t1Score = parseInt(tempScore.t1);
                  const t2Score = parseInt(tempScore.t2);
                  const champion =
                    t1Score > t2Score
                      ? finalTeams.finalist1
                      : finalTeams.finalist2;

                  // Update the final match with results
                  if (finalMatch) {
                    const updatedFinalMatch = {
                      ...finalMatch,
                      score: { t1: t1Score, t2: t2Score },
                      winner: champion.id,
                      finished: true,
                    };
                    onFinalSubmit?.(updatedFinalMatch);
                  }

                  onFinalsComplete(champion);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Submit Final Score & Crowning Champion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
