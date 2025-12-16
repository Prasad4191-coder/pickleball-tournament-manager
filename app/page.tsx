'use client';

import { useState } from 'react';
import TeamSelectionScreen from '@/components/tournament/team-selection-screen';
import TeamInputScreen from '@/components/tournament/team-input-screen';
import MatchScoringScreen from '@/components/tournament/match-scoring-screen';
import FinalsScreen from '@/components/tournament/finals-screen';
import WinnerScreen from '@/components/tournament/winner-screen';
import MiniGameScorer from '@/components/tournament/mini-game-scorer';
import FormatSelectionScreen from '@/components/tournament/format-selection-screen';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type Team = {
  id: string;
  teamName: string;
  players: [string, string];
};

export type Match = {
  id: number;
  team1: string;
  team2: string;
  team1Name: string;
  team2Name: string;
  score: { t1: number; t2: number };
  winner: string | null;
  finished: boolean;
};

export type MatchFormat = 'bestOf3' | 'bestOf5' | null;

export type MiniGameMatch = {
  id: number;
  team1: string;
  team2: string;
  team1Name: string;
  team2Name: string;
  score: { t1: number; t2: number };
  winner: string | null;
  finished: boolean;
};

export type SemifinalMatch = {
  id: number;
  team1: string;
  team2: string;
  team1Name: string;
  team2Name: string;
  score: { t1: number; t2: number };
  winner: string | null;
  finished: boolean;
};

export type FinalMatch = {
  id: number;
  team1: string;
  team2: string;
  team1Name: string;
  team2Name: string;
  score: { t1: number; t2: number };
  winner: string | null;
  finished: boolean;
};

type Screen =
  | 'teamSelection'
  | 'teamInput'
  | 'formatSelection'
  | 'matchScoring'
  | 'miniGames'
  | 'finals'
  | 'winner';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('teamSelection');
  const [teamCount, setTeamCount] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [miniGames, setMiniGames] = useState<MiniGameMatch[]>([]);
  const [semifinalMatches, setSemifinalMatches] = useState<SemifinalMatch[]>([]);
  const [semifinalMatch, setSemifinalMatch] = useState<SemifinalMatch | null>(null);
  const [finalMatch, setFinalMatch] = useState<FinalMatch | null>(null);
  const [champion, setChampion] = useState<Team | null>(null);
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(null);

  const handleTeamCountSelect = (count: number) => {
    setTeamCount(count);
    if (count === 2) {
      setScreen('formatSelection');
    } else {
      setScreen('teamInput');
    }
  };

  const handleFormatSelect = (format: MatchFormat) => {
    setMatchFormat(format);
    setScreen('teamInput');
  };

  const handleTeamsSubmit = (submittedTeams: Team[]) => {
    setTeams(submittedTeams);
    const generatedMatches = generateRoundRobinMatches(submittedTeams);
    setMatches(generatedMatches);
    setScreen('matchScoring');
  };

  const generateRoundRobinMatches = (teamList: Team[]): Match[] => {
    const matches: Match[] = [];
    let matchId = 1;

    if (teamList.length === 2) {
      const maxGames = matchFormat === 'bestOf5' ? 5 : 3;
      for (let i = 0; i < maxGames; i++) {
        matches.push({
          id: matchId++,
          team1: teamList[0].id,
          team2: teamList[1].id,
          team1Name: teamList[0].teamName,
          team2Name: teamList[1].teamName,
          score: { t1: 0, t2: 0 },
          winner: null,
          finished: false,
        });
      }
    } else {
      for (let i = 0; i < teamList.length; i++) {
        for (let j = i + 1; j < teamList.length; j++) {
          // Randomize home/away assignment
          const isOrderFlipped = Math.random() < 0.5;
          const t1 = isOrderFlipped ? teamList[j] : teamList[i];
          const t2 = isOrderFlipped ? teamList[i] : teamList[j];

          matches.push({
            id: matchId++,
            team1: t1.id,
            team2: t2.id,
            team1Name: t1.teamName,
            team2Name: t2.teamName,
            score: { t1: 0, t2: 0 },
            winner: null,
            finished: false,
          });
        }
      }
    }
    // Fisher-Yates shuffle
    for (let i = matches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matches[i], matches[j]] = [matches[j], matches[i]];
    }

    // Re-assign IDs after shuffle to keep them sequential
    return matches.map((match, index) => ({
      ...match,
      id: index + 1
    }));
  };

  const handleScoreSubmit = (matchId: number, score: { t1: number; t2: number }) => {
    setMatches((prevMatches) =>
      prevMatches.map((m) => {
        if (m.id === matchId) {
          let winner = null;

          if (score.t1 === 7 && score.t2 < 7) {
            winner = m.team1;
          } else if (score.t2 === 7 && score.t1 < 7) {
            winner = m.team2;
          } else if (score.t1 >= 11 && score.t1 - score.t2 >= 2) {
            winner = m.team1;
          } else if (score.t2 >= 11 && score.t2 - score.t1 >= 2) {
            winner = m.team2;
          }

          return {
            ...m,
            score,
            winner,
            finished: winner !== null,
          };
        }
        return m;
      })
    );
  };

  const handleMiniGameScoreSubmit = (matchId: number, score: { t1: number; t2: number }) => {
    setMiniGames((prevGames) =>
      prevGames.map((m) => {
        if (m.id === matchId) {
          let winner = null;

          // 7-point mini-games: first to 7, win by 1
          if (score.t1 === 7 && score.t2 < 7) {
            winner = m.team1;
          } else if (score.t2 === 7 && score.t1 < 7) {
            winner = m.team2;
          } else if (score.t1 >= 7 && score.t1 - score.t2 >= 1) {
            winner = m.team1;
          } else if (score.t2 >= 7 && score.t2 - score.t1 >= 1) {
            winner = m.team2;
          }

          return {
            ...m,
            score,
            winner,
            finished: winner !== null,
          };
        }
        return m;
      })
    );
  };

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

  const getRankings = (): Array<{
    team: Team;
    wins: number;
    losses: number;
    pointDiff: number;
    totalPoints: number;
  }> => {
    const rankings = teams.map((team) => {
      const record = getTeamRecord(team.id);
      const pointsFor = matches
        .filter((m) => m.finished && (m.team1 === team.id || m.team2 === team.id))
        .reduce((sum, m) => {
          return (
            sum +
            (m.team1 === team.id ? m.score.t1 : m.score.t2)
          );
        }, 0);
      const pointsAgainst = matches
        .filter((m) => m.finished && (m.team1 === team.id || m.team2 === team.id))
        .reduce((sum, m) => {
          return (
            sum +
            (m.team1 === team.id ? m.score.t2 : m.score.t1)
          );
        }, 0);
      return {
        team,
        wins: record.wins,
        losses: record.losses,
        pointDiff: pointsFor - pointsAgainst,
        totalPoints: pointsFor,
      };
    });

    return rankings
      .sort(
        (a, b) =>
          b.wins - a.wins ||
          b.pointDiff - a.pointDiff ||
          b.totalPoints - a.totalPoints
      );
  };

  const allMatchesFinished = matches.every((m) => m.finished);

  const areAllTeamsCompletelyTied = (): boolean => {
    const rankings = getRankings();
    if (rankings.length !== 3) return false;

    const r0 = rankings[0];
    const r1 = rankings[1];
    const r2 = rankings[2];

    return (
      r0.wins === r1.wins &&
      r1.wins === r2.wins &&
      r0.pointDiff === r1.pointDiff &&
      r1.pointDiff === r2.pointDiff &&
      r0.totalPoints === r1.totalPoints &&
      r1.totalPoints === r2.totalPoints
    );
  };

  const generateMiniGames = (): MiniGameMatch[] => {
    const sorted = getRankings();
    const miniGameMatches: MiniGameMatch[] = [];

    // Match 1: Team 1 vs Team 2
    miniGameMatches.push({
      id: 1,
      team1: sorted[0].team.id,
      team2: sorted[1].team.id,
      team1Name: sorted[0].team.teamName,
      team2Name: sorted[1].team.teamName,
      score: { t1: 0, t2: 0 },
      winner: null,
      finished: false,
    });

    // Match 2: Team 2 vs Team 3
    miniGameMatches.push({
      id: 2,
      team1: sorted[1].team.id,
      team2: sorted[2].team.id,
      team1Name: sorted[1].team.teamName,
      team2Name: sorted[2].team.teamName,
      score: { t1: 0, t2: 0 },
      winner: null,
      finished: false,
    });

    // Match 3: Team 1 vs Team 3
    miniGameMatches.push({
      id: 3,
      team1: sorted[0].team.id,
      team2: sorted[2].team.id,
      team1Name: sorted[0].team.teamName,
      team2Name: sorted[2].team.teamName,
      score: { t1: 0, t2: 0 },
      winner: null,
      finished: false,
    });

    return miniGameMatches;
  };

  const handle3TeamLogic = () => {
    if (areAllTeamsCompletelyTied()) {
      setMiniGames(generateMiniGames());
      setScreen('miniGames');
    } else {
      const rankings = getRankings();
      const firstPlaceWins = rankings[0].wins;
      const secondPlaceWins = rankings[1].wins;

      if (firstPlaceWins === 2) {
        setScreen('finals');
      } else if (firstPlaceWins === 1 && secondPlaceWins === 1) {
        setScreen('finals');
      }
    }
  };

  const handle2TeamLogic = () => {
    const rankings = getRankings();
    const winTarget = matchFormat === 'bestOf5' ? 3 : 2;

    // Check if one team has won the series
    if (rankings[0].wins === winTarget) {
      setChampion(rankings[0].team);
      setScreen('winner');
    }
  };

  const handleFinalsComplete = (finalWinner: Team) => {
    setChampion(finalWinner);
    setScreen('winner');
  };

  const handleReset = () => {
    setScreen('teamSelection');
    setTeamCount(0);
    setTeams([]);
    setMatches([]);
    setMiniGames([]);
    setSemifinalMatch(null);
    setSemifinalMatches([]);
    setFinalMatch(null);
    setChampion(null);
    setMatchFormat(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {screen === 'teamSelection' && (
          <TeamSelectionScreen onSelectTeamCount={handleTeamCountSelect} />
        )}
        {screen === 'formatSelection' && (
          <FormatSelectionScreen
            onSelectFormat={handleFormatSelect}
            onBack={() => setScreen('teamSelection')}
          />
        )}
        {screen === 'teamInput' && (
          <TeamInputScreen
            teamCount={teamCount}
            onSubmit={handleTeamsSubmit}
            onBack={() => {
              if (teamCount === 2) {
                setScreen('formatSelection');
              } else {
                setScreen('teamSelection');
              }
            }}
          />
        )}
        {screen === 'matchScoring' && teamCount === 2 && (
          <MatchScoringScreen
            matches={matches}
            teams={teams}
            onScoreSubmit={handleScoreSubmit}
            allMatchesFinished={allMatchesFinished}
            onContinue={handle2TeamLogic}
            onBack={() => setScreen('teamInput')}
            teamCount={teamCount}
            getRankings={getRankings}
            matchFormat={matchFormat}
          />
        )}
        {screen === 'matchScoring' && teamCount > 3 && (
          <MatchScoringScreen
            matches={matches}
            teams={teams}
            onScoreSubmit={handleScoreSubmit}
            allMatchesFinished={allMatchesFinished}
            onContinue={() => {
              setScreen('finals');
            }}
            onBack={() => setScreen('teamInput')}
            teamCount={teamCount}
            getRankings={getRankings}
          />
        )}
        {screen === 'matchScoring' && teamCount === 3 && (
          <MatchScoringScreen
            matches={matches}
            teams={teams}
            onScoreSubmit={handleScoreSubmit}
            allMatchesFinished={allMatchesFinished}
            onContinue={handle3TeamLogic}
            onBack={() => setScreen('teamInput')}
            teamCount={teamCount}
            getRankings={getRankings}
          />
        )}
        {screen === 'miniGames' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-green-700">Tiebreaker Mini-Games</h1>
                <p className="text-sm text-gray-600 mt-1">All teams are completely tied. Playing 7-point mini-games to determine finalists.</p>
              </div>
              <Button variant="outline" onClick={() => setScreen('matchScoring')}>
                Back
              </Button>
            </div>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle>Tiebreaker Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Each match is first to 7 points, win by 1</p>
                <p>• If a team wins both mini-games → advances to finals</p>
                <p>• Otherwise, top seeds advance based on mini-game results</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {miniGames.map((game) => (
                <Card key={game.id} className={`overflow-hidden transition-opacity ${game.finished ? 'opacity-60' : ''}`}>
                  <CardHeader className="bg-green-50 py-3">
                    <CardTitle className="text-base">
                      Mini-Game {game.id}: {game.team1Name} vs {game.team2Name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {game.finished ? (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{game.team1Name}: {game.score.t1}</p>
                          <p className="text-sm font-medium">{game.team2Name}: {game.score.t2}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {game.winner === game.team1 ? game.team1Name : game.team2Name} wins
                          </p>
                        </div>
                      </div>
                    ) : (
                      <MiniGameScorer
                        game={game}
                        onSubmit={(score) => handleMiniGameScoreSubmit(game.id, score)}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {miniGames.every((g) => g.finished) && (
              <Button
                onClick={() => {
                  // Determine finalists based on mini-games
                  const miniGameWins: Record<string, number> = {};
                  miniGames.forEach((g) => {
                    if (g.winner) {
                      miniGameWins[g.winner] = (miniGameWins[g.winner] || 0) + 1;
                    }
                  });

                  // Find the team with most mini-game wins
                  const sortedByMiniGames = Object.entries(miniGameWins)
                    .sort((a, b) => b[1] - a[1])
                    .map(([teamId]) => teams.find((t) => t.id === teamId))
                    .filter(Boolean) as Team[];

                  // If one team won both, they go to finals; determine other finalist from remaining teams
                  setScreen('finals');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 mt-6"
              >
                Continue to Finals
              </Button>
            )}
          </div>
        )}
        {screen === 'finals' && (
          <FinalsScreen
            teams={teams}
            matches={matches}
            onFinalsComplete={handleFinalsComplete}
            onBack={() => setScreen('matchScoring')}
            teamCount={teamCount}
            getRankings={getRankings}
            miniGames={miniGames}
            onSemifinalSubmit={(semifinal) => setSemifinalMatch(semifinal)}
            semifinalMatches={semifinalMatches}
            onSemifinalMatchesSubmit={(matches) => setSemifinalMatches(matches)}
            onFinalSubmit={(final) => setFinalMatch(final)}
          />
        )}
        {screen === 'winner' && champion && (
          <WinnerScreen
            champion={champion}
            onReset={handleReset}
            teams={teams}
            matches={matches}
            teamCount={teamCount}
            semifinalMatch={semifinalMatch}
            semifinalMatches={semifinalMatches}
            finalMatch={finalMatch}
          />
        )}
      </div>
    </main>
  );
}
