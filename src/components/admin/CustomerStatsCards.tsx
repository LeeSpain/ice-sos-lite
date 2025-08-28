import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, DollarSign, Globe, UserCheck, UserX, Shield, AlertTriangle } from "lucide-react";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeAnalytics";
import { useFamilyAnalytics } from "@/hooks/useFamilyAnalytics";

interface CustomerStatsCardsProps {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

export function CustomerStatsCards({ 
  totalCustomers, 
  newCustomersThisMonth, 
  activeSubscriptions, 
  totalRevenue 
}: CustomerStatsCardsProps) {
  const { data: metrics } = useRealTimeAnalytics();
  const { data: familyMetrics } = useFamilyAnalytics();
  
  const customerGrowthRate = newCustomersThisMonth > 0 ? 
    ((newCustomersThisMonth / totalCustomers) * 100).toFixed(1) : "0.0";
  
  const subscriptionRate = totalCustomers > 0 ? 
    ((activeSubscriptions / totalCustomers) * 100).toFixed(1) : "0.0";

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      trend: `+${newCustomersThisMonth} this month`,
      trendUp: true,
      gradient: "from-primary/20 to-primary/5"
    },
    {
      title: "Monthly Growth",
      value: `${customerGrowthRate}%`,
      icon: TrendingUp,
      trend: `${newCustomersThisMonth} new customers`,
      trendUp: newCustomersThisMonth > 0,
      gradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      icon: UserCheck,
      trend: `${subscriptionRate}% conversion rate`,
      trendUp: true,
      gradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      title: "Total Revenue",
      value: `€${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: `€${(totalRevenue / totalCustomers || 0).toFixed(0)} avg per customer`,
      trendUp: true,
      gradient: "from-amber-500/20 to-amber-500/5"
    },
    {
      title: "Global Reach",
      value: "12+",
      icon: Globe,
      trend: "countries served",
      trendUp: true,
      gradient: "from-purple-500/20 to-purple-500/5"
    },
    {
      title: "Inactive Users",
      value: (totalCustomers - activeSubscriptions).toLocaleString(),
      icon: UserX,
      trend: `${(100 - parseFloat(subscriptionRate)).toFixed(1)}% inactive`,
      trendUp: false,
      gradient: "from-red-500/20 to-red-500/5"
    },
    {
      title: "Family Connections",
      value: (familyMetrics?.activeFamilyMembers || 0).toLocaleString(),
      icon: Shield,
      trend: `${familyMetrics?.totalFamilyGroups || 0} family groups`,
      trendUp: true,
      gradient: "from-cyan-500/20 to-cyan-500/5"
    },
    {
      title: "Active SOS Events",
      value: (familyMetrics?.activeSosEvents || 0).toLocaleString(),
      icon: AlertTriangle,
      trend: `${familyMetrics?.totalSosEvents || 0} total events`,
      trendUp: false,
      gradient: "from-orange-500/20 to-orange-500/5"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-xs">
                <Badge 
                  variant={stat.trendUp ? "default" : "secondary"}
                  className={`text-xs ${stat.trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}
                >
                  {stat.trend}
                </Badge>
              </div>
              {stat.title === "Active Subscriptions" && (
                <Progress 
                  value={parseFloat(subscriptionRate)} 
                  className="mt-3 h-2"
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}