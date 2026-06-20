'use client';

import React from 'react';
import { useFilters } from '@/context/FilterContext';
import { DataService } from '@/services/dataService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge } from '@/components/ui';
import { Users, Award, TrendingUp, Clock, Calendar, CheckCircle } from 'lucide-react';
import { formatDA } from '@/lib/utils';

export default function EmployeesPage() {
  const { filters } = useFilters();
  const leaderboard = DataService.getCommercialLeaderboard(filters);

  // Compute aggregate statistics for the commercial team based on the active filters
  const totalRevenueWon = leaderboard.reduce((sum, item) => sum + item.wonValue, 0);
  const totalDealsWon = leaderboard.reduce((sum, item) => sum + item.wonCount, 0);
  const avgConversion = leaderboard.length > 0 
    ? Math.round(leaderboard.reduce((sum, item) => sum + item.conversionRate, 0) / leaderboard.length) 
    : 30;
  const avgFollowUpTime = leaderboard.length > 0 
    ? (leaderboard.reduce((sum, item) => sum + item.avgFollowUp, 0) / leaderboard.length).toFixed(1) 
    : '1.2';
  const totalMeetings = leaderboard.reduce((sum, item) => sum + item.meetings, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Efficacité Commerciale</h2>
        <p className="text-xs text-slate-500 mt-1">
          Classement et analyse en temps réel des performances individuelles de l'équipe commerciale.
        </p>
      </div>

      {/* Team Aggregates Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border border-[#DCE5EE] flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-[#6B7C93]">
            <span className="text-[9px] font-bold uppercase tracking-wider">CA Négocié Gagné</span>
            <TrendingUp size={14} className="text-[#4DA3FF]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-[#17345C]">{formatDA(totalRevenueWon)}</h3>
            <p className="text-[9px] text-emerald-600 font-bold mt-1">+12.4% vs période préc.</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5EE] flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-[#6B7C93]">
            <span className="text-[9px] font-bold uppercase tracking-wider">Opportunités Gagnées</span>
            <CheckCircle size={14} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-[#17345C]">{totalDealsWon} deals</h3>
            <p className="text-[9px] text-emerald-600 font-bold mt-1">+5% de conversion</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5EE] flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-[#6B7C93]">
            <span className="text-[9px] font-bold uppercase tracking-wider">Taux Conv. Moyen</span>
            <Award size={14} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-[#17345C]">{avgConversion}%</h3>
            <p className="text-[9px] text-[#6B7C93] font-bold mt-1">Constant avec prévisions</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5EE] flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-[#6B7C93]">
            <span className="text-[9px] font-bold uppercase tracking-wider">Relance Moyenne</span>
            <Clock size={14} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-[#17345C]">{avgFollowUpTime} heures</h3>
            <p className="text-[9px] text-emerald-600 font-bold mt-1">-0.4h vs mois préc.</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#DCE5EE] flex flex-col justify-between h-28 col-span-2 md:col-span-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6B7C93]">
            <span className="text-[9px] font-bold uppercase tracking-wider">Réunions Qualifiées</span>
            <Calendar size={14} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-[#17345C]">{totalMeetings} rendez-vous</h3>
            <p className="text-[9px] text-emerald-600 font-bold mt-1">+15% d'activité</p>
          </div>
        </Card>
      </div>

      {/* Leaderboard Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Classement de l'Équipe Commerciale</CardTitle>
          <CardDescription>
            Performance triée par valeur des ventes remportées (chiffre d'affaires converti).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3 text-center w-16">Rang</th>
                  <th className="px-6 py-3">Collaborateur</th>
                  <th className="px-6 py-3 text-right">CA Remporté</th>
                  <th className="px-6 py-3 text-center">Deals Gagnés</th>
                  <th className="px-6 py-3 text-center">Taux Conversion</th>
                  <th className="px-6 py-3 text-center">Délai de Relance</th>
                  <th className="px-6 py-3 text-center">Meetings Actifs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leaderboard.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          rank === 1 ? 'bg-amber-100 text-amber-800' :
                          rank === 2 ? 'bg-slate-200 text-slate-800' :
                          rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {rank}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Simulated Avatar Placeholder */}
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs uppercase border border-slate-200">
                            {item.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-800">
                        {formatDA(item.wonValue)}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-600">
                        {item.wonCount}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold text-slate-700">{item.conversionRate}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${
                                item.conversionRate >= 45 ? 'bg-emerald-500' :
                                item.conversionRate >= 30 ? 'bg-moustachir-secondary' :
                                'bg-amber-500'
                              }`} 
                              style={{ width: `${item.conversionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <Badge variant={item.avgFollowUp <= 1.0 ? 'success' : item.avgFollowUp <= 1.5 ? 'info' : 'warning'}>
                          {item.avgFollowUp}h
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-600">
                        {item.meetings}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
