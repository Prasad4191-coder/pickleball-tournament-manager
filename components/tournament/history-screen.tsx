'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Team, Match } from '@/app/page';

export type TournamentHistoryItem = {
    id: string;
    date: string;
    champion: Team;
    teams: Team[];
    matches: Match[];
    standings: { teamId: string; wins: number; pointDiff: number }[];
};

interface HistoryScreenProps {
    history: TournamentHistoryItem[];
    onBack: () => void;
}

export default function HistoryScreen({ history, onBack }: HistoryScreenProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-green-700">Tournament History</h1>
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
            </div>

            {history.length === 0 ? (
                <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="py-8 text-center text-gray-500">
                        No tournament history yet. Complete a tournament to see it here!
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {history.slice().reverse().map((item) => (
                        <Card key={item.id} className="overflow-hidden border-2 border-green-100">
                            <CardHeader className="bg-green-50 py-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-green-800">
                                        {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString()}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🏆</span>
                                    <span className="font-bold text-green-700">{item.champion.teamName}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Champion Team</h4>
                                        <p className="text-sm text-gray-600">
                                            {item.champion.players[0]} & {item.champion.players[1]}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Top Standings</h4>
                                        <ul className="text-sm space-y-1">
                                            {item.standings.slice(0, 3).map((standing, idx) => {
                                                const team = item.teams.find((t) => t.id === standing.teamId);
                                                return (
                                                    <li key={standing.teamId} className="flex justify-between">
                                                        <span>{idx + 1}. {team?.teamName}</span>
                                                        <span className="text-gray-500">{standing.wins} Wins</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
