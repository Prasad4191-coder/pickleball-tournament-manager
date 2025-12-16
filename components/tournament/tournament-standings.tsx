'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Team, Match } from '@/app/page';
import { useRef } from 'react';
import { toPng } from 'html-to-image';

interface TournamentStandingsProps {
  teams: Team[];
  matches: Match[];
  champion: Team;
  teamCount: number;
  semifinalMatch?: any;
  semifinalMatches?: Match[];
  finalMatch?: any;
}

export default function TournamentStandings({
  teams,
  matches,
  champion,
  teamCount,
  semifinalMatch,
  semifinalMatches: propSemifinalMatches,
  finalMatch,
}: TournamentStandingsProps) {
  const standingsRef = useRef<HTMLDivElement>(null);

  const getTeamRecord = (teamId: string): { wins: number; losses: number } => {
    let wins = 0;
    let losses = 0;
    matches.forEach((m) => {
      if (m.finished) {
        if (m.team1 === teamId && m.winner === teamId) wins++;
        else if (m.team1 === teamId) losses++;
        else if (m.team2 === teamId && m.winner === teamId) wins++;
        else if (m.team2 === teamId) losses++;
      }
    });
    return { wins, losses };
  };

  const getTeamStats = (teamId: string) => {
    const record = getTeamRecord(teamId);
    const pointsFor = matches
      .filter((m) => m.finished && (m.team1 === teamId || m.team2 === teamId))
      .reduce((sum, m) => sum + (m.team1 === teamId ? m.score.t1 : m.score.t2), 0);
    const pointsAgainst = matches
      .filter((m) => m.finished && (m.team1 === teamId || m.team2 === teamId))
      .reduce((sum, m) => sum + (m.team1 === teamId ? m.score.t2 : m.score.t1), 0);

    return {
      ...record,
      pointsFor,
      pointsAgainst,
      pointDiff: pointsFor - pointsAgainst,
    };
  };

  const getRankings = () => {
    return teams
      .map((team) => ({
        team,
        ...getTeamStats(team.id),
      }))
      .sort((a, b) => b.wins - a.wins || b.pointDiff - a.pointDiff || b.pointsFor - a.pointsFor);
  };

  const getMatchesByStage = () => {
    const leagueMatches = matches.filter(m => m.finished);
    let semifinalMatches: Match[] = [];

    if (propSemifinalMatches && propSemifinalMatches.length > 0) {
      semifinalMatches = propSemifinalMatches.filter(m => m.finished);
    } else if (semifinalMatch && semifinalMatch.finished) {
      semifinalMatches = [semifinalMatch];
    }

    const finalMatches = finalMatch && finalMatch.finished ? [finalMatch] : [];

    return { leagueMatches, semifinalMatches, finalMatches };
  };

  const handleDownload = async () => {
    if (standingsRef.current) {
      try {
        const dataUrl = await toPng(standingsRef.current, {
          backgroundColor: '#f0fdf4', // Match the bg-green-50 color
          pixelRatio: 2, // Higher quality
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `pickleball-tournament-standings-${new Date().getTime()}.png`;
        link.click();
      } catch (error) {
        console.error('Error downloading standings:', error);
        alert('Failed to download standings image. Please try again.');
      }
    }
  };

  const rankings = getRankings();
  const { leagueMatches, semifinalMatches, finalMatches } = getMatchesByStage();

  return (
    <div className="space-y-6">
      <div ref={standingsRef} className="bg-green-50 p-6 rounded-lg border-2 border-green-200 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Tournament Final Standings</h2>
          <p className="text-gray-600">Pickleball Tournament Results</p>
        </div>

        {/* League Stage Results */}
        {leagueMatches.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-bold text-green-700 mb-4">League Stage Results</h3>
            <div className="space-y-2">
              {leagueMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      Match {match.id}: {match.team1Name} vs {match.team2Name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {match.score.t1}-{match.score.t2}
                    </p>
                    <p className="text-xs text-green-600 font-semibold">
                      {match.winner === match.team1 ? match.team1Name : match.team2Name} wins
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Semifinals Results */}
        {semifinalMatches.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-700 mb-4">Semifinals Results</h3>
            <div className="space-y-2">
              {semifinalMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {match.team1Name} vs {match.team2Name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {match.score.t1}-{match.score.t2}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">
                      {match.winner === match.team1 ? match.team1Name : match.team2Name} wins
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finals Result */}
        {finalMatches.length > 0 && (
          <div className="bg-white rounded-lg p-4 border-2 border-yellow-400">
            <h3 className="text-lg font-bold text-yellow-700 mb-4">Finals Result</h3>
            <div className="space-y-2">
              {finalMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {match.team1Name} vs {match.team2Name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {match.score.t1}-{match.score.t2}
                    </p>
                    <p className="text-sm font-bold text-yellow-700">
                      {match.winner === match.team1 ? match.team1Name : match.team2Name} WINS!
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Champion Highlight */}
        <div className="text-center">
          <div className="inline-block bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">CHAMPION</p>
            <p className="text-2xl font-bold text-green-700">{champion.teamName}</p>
            <p className="text-xs text-gray-600 mt-1">
              {champion.players[0]} & {champion.players[1]}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-green-300 bg-green-100">
                <th className="text-left px-4 py-3 font-bold text-green-700">Position</th>
                <th className="text-left px-4 py-3 font-bold text-green-700">Team Name</th>
                <th className="text-center px-4 py-3 font-bold text-green-700">Players</th>
                <th className="text-center px-4 py-3 font-bold text-green-700">W-L</th>
                <th className="text-center px-4 py-3 font-bold text-green-700">Pts For</th>
                <th className="text-center px-4 py-3 font-bold text-green-700">Pts Against</th>
                <th className="text-center px-4 py-3 font-bold text-green-700">Pt Diff</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking, index) => (
                <tr
                  key={ranking.team.id}
                  className={`border-b border-green-200 ${ranking.team.id === champion.id ? 'bg-yellow-50' : ''
                    }`}
                >
                  <td className="px-4 py-3 font-bold text-lg text-green-700">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {ranking.team.teamName}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 text-xs">
                    <div>{ranking.team.players[0]}</div>
                    <div>{ranking.team.players[1]}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">
                    {ranking.wins}-{ranking.losses}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {ranking.pointsFor}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {ranking.pointsAgainst}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">
                    {ranking.pointDiff > 0 ? '+' : ''}{ranking.pointDiff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600 border-t border-green-200 pt-4">
          <p>Tournament Date: {new Date().toLocaleDateString()}</p>
          <p>Total Matches: {leagueMatches.length + semifinalMatches.length + finalMatches.length}</p>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Standings as Image
      </button>
    </div>
  );
}
