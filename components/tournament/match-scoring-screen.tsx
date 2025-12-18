'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team, Match } from '@/app/page';

interface MatchScoringScreenProps {
  matches: Match[];
  teams: Team[];
  onScoreSubmit: (matchId: number, score: { t1: number; t2: number }) => void;
  allMatchesFinished: boolean;
  onContinue: () => void;
  onBack: () => void;
  teamCount: number;
  getRankings: () => Array<{
    team: Team;
    wins: number;
    losses: number;
    pointDiff: number;
    totalPoints: number;
  }>;
  matchFormat?: 'bestOf3' | 'bestOf5' | null;
}

export default function MatchScoringScreen({
  matches,
  teams,
  onScoreSubmit,
  allMatchesFinished,
  onContinue,
  onBack,
  teamCount,
  getRankings,
  matchFormat,
}: MatchScoringScreenProps) {
  const [tempScores, setTempScores] = useState<Record<number, { t1: string; t2: string }>>({});

  const handleScoreChange = (matchId: number, team: 't1' | 't2', value: string) => {
    setTempScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { t1: '', t2: '' },
        [team]: value,
      },
    }));
  };

  const handleSubmitScore = (matchId: number) => {
    const score = tempScores[matchId];
    if (!score || score.t1 === '' || score.t2 === '') {
      alert('Please enter both scores');
      return;
    }

    const t1Score = parseInt(score.t1);
    const t2Score = parseInt(score.t2);

    if (isNaN(t1Score) || isNaN(t2Score)) {
      alert('Please enter valid numbers');
      return;
    }

    onScoreSubmit(matchId, { t1: t1Score, t2: t2Score });
    setTempScores((prev) => {
      const newScores = { ...prev };
      delete newScores[matchId];
      return newScores;
    });
  };

  const finishedCount = matches.filter((m) => m.finished).length;
  const rankings = getRankings();
  const areAllTeamsCompletelyTied = rankings.every((ranking) => ranking.wins === rankings[0].wins && ranking.pointDiff === rankings[0].pointDiff && ranking.totalPoints === rankings[0].totalPoints);

  const winTarget = matchFormat === 'bestOf5' ? 3 : (matchFormat === 'bestOf3' ? 2 : null);
  const seriesWinner = rankings[0]?.wins === winTarget ? rankings[0].team : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Match Scoring</h1>
          <p className="text-sm text-gray-600 mt-1">
            {finishedCount} of {matches.length} matches completed
            {teamCount === 2 && matchFormat && ` - ${matchFormat === 'bestOf3' ? 'Best of 3' : 'Best of 5'}`}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="w-full bg-green-100 rounded-lg h-2">
        <div
          className="bg-green-600 h-2 rounded-lg transition-all"
          style={{ width: `${(finishedCount / matches.length) * 100}%` }}
        ></div>
      </div>

      {allMatchesFinished && (
        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">
                {teamCount === 2 ? `${matchFormat === 'bestOf5' ? 'Best of 5' : 'Best of 3'} Series` : 'Current Standings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rankings.map((ranking, index) => {
                  const isEliminated = teamCount === 3 && ranking.wins === 0;
                  return (
                    <div
                      key={ranking.team.id}
                      className={`flex flex-col p-3 rounded-lg ${isEliminated
                          ? 'bg-gray-200 opacity-60'
                          : index === 0
                            ? 'bg-yellow-100'
                            : 'bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-semibold ${isEliminated ? 'text-gray-500 line-through' : 'text-gray-800'
                            }`}
                        >
                          {index + 1}. {ranking.team.teamName}
                        </p>
                        {isEliminated && (
                          <span className="text-xs font-semibold text-gray-500">
                            ELIMINATED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Record: {ranking.wins}W-{ranking.losses}L | Point Diff: {ranking.pointDiff > 0 ? '+' : ''}{ranking.pointDiff} | Total Points: {ranking.totalPoints}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {teamCount === 2 && seriesWinner && (
            <Card className="border-green-500 bg-green-100">
              <CardHeader>
                <CardTitle className="text-base text-green-700">Series Winner!</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-bold text-lg text-green-800">{seriesWinner.teamName}</p>
                <p className="text-sm text-green-700 mt-2">
                  Won {winTarget}-{rankings[1]?.wins || 0} in {matchFormat === 'bestOf5' ? 'Best of 5' : 'Best of 3'}
                </p>
              </CardContent>
            </Card>
          )}

          {teamCount === 3 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-base">Finals Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                {areAllTeamsCompletelyTied ? (
                  <div>
                    <p className="font-semibold text-orange-700 mb-2">
                      ⚠ Complete Tiebreaker Required
                    </p>
                    <div className="bg-orange-100 p-3 rounded">
                      <p className="text-xs font-medium mb-2">All teams tied on:</p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Wins: {rankings[0].wins}W each</li>
                        <li>• Point Differential: {rankings[0].pointDiff > 0 ? '+' : ''}{rankings[0].pointDiff} each</li>
                        <li>• Total Points: {rankings[0].totalPoints} each</li>
                      </ul>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-semibold">
                      Next: Play 7-point mini-games to determine finalists!
                    </p>
                  </div>
                ) : rankings[0].wins === 2 ? (
                  <div>
                    <p className="font-semibold text-green-700 mb-2">
                      ✓ Direct to Finals
                    </p>
                    <div className="space-y-2 bg-white p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rankings[0].team.teamName}</span>
                        <span className="text-xs bg-yellow-200 px-2 py-1 rounded">2 Wins</span>
                      </div>
                      <p className="text-xs text-gray-600">Record: {rankings[0].wins}W-{rankings[0].losses}L | Points: {rankings[0].totalPoints}</p>
                    </div>
                    <p className="text-gray-700 my-2 text-center text-xs font-semibold">VS</p>
                    <div className="bg-white p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rankings[1].team.teamName}</span>
                        <span className="text-xs bg-blue-200 px-2 py-1 rounded">1 Win</span>
                      </div>
                      <p className="text-xs text-gray-600">Record: {rankings[1].wins}W-{rankings[1].losses}L | Points: {rankings[1].totalPoints}</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-semibold">
                      Why: {rankings[0].team.teamName} secured first place with 2 wins, automatically advances. {rankings[1].team.teamName} advances as highest seed among remaining teams.
                    </p>
                  </div>
                ) : rankings[0].wins === 1 && rankings[1].wins === 1 && rankings[2].wins === 1 ? (
                  <div>
                    <p className="font-semibold text-purple-700 mb-2">
                      Semifinals Required
                    </p>
                    <div className="space-y-2 bg-white p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rankings[0].team.teamName}</span>
                        <span className="text-xs bg-green-200 px-2 py-1 rounded">Bye to Final</span>
                      </div>
                      <p className="text-xs text-gray-600">Record: 1-1 | Points: {rankings[0].totalPoints}</p>
                    </div>
                    <p className="text-gray-700 my-2 text-center text-xs font-semibold">Semifinal</p>
                    <div className="bg-white p-2 rounded">
                      <p className="text-xs font-medium mb-2">{rankings[1].team.teamName} vs {rankings[2].team.teamName}</p>
                      <p className="text-xs text-gray-600">{rankings[1].team.teamName} (1-1, Points: {rankings[1].totalPoints}) vs {rankings[2].team.teamName} (1-1, Points: {rankings[2].totalPoints})</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-semibold">
                      Why: All teams are 1-1, so {rankings[0].team.teamName} gets a bye based on point differential. Winner of {rankings[1].team.teamName} vs {rankings[2].team.teamName} advances to final.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-3">
        {matches.map((match) => (
          <Card
            key={match.id}
            className={`overflow-hidden transition-opacity ${match.finished ? 'opacity-60' : ''
              }`}
          >
            <CardHeader className="bg-green-50 py-3">
              <CardTitle className="text-base">
                {teamCount === 2 ? `Game ${match.id}` : `Match ${match.id}`}: {match.team1Name} vs {match.team2Name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {match.finished ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {match.team1Name}: {match.score.t1}
                    </p>
                    <p className="text-sm font-medium">
                      {match.team2Name}: {match.score.t2}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {match.winner === match.team1 ? match.team1Name : match.team2Name} wins
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {match.team1Name}
                        <span className="block text-xs text-gray-500 font-normal">
                          {teams.find((t) => t.id === match.team1)?.players.join(' & ')}
                        </span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Score"
                        value={tempScores[match.id]?.t1 ?? ''}
                        onChange={(e) => handleScoreChange(match.id, 't1', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {match.team2Name}
                        <span className="block text-xs text-gray-500 font-normal">
                          {teams.find((t) => t.id === match.team2)?.players.join(' & ')}
                        </span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Score"
                        value={tempScores[match.id]?.t2 ?? ''}
                        onChange={(e) => handleScoreChange(match.id, 't2', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSubmitScore(match.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Submit Score
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {allMatchesFinished && (
        <Button
          onClick={onContinue}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 mt-6"
        >
          {teamCount === 2 ? 'View Champion' : 'Continue to Results'}
        </Button>
      )}
    </div>
  );
}
