import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Target, TrendingUp, Users, MessageSquare } from 'lucide-react';

interface Lead {
  id: string;
  session_id: string;
  email?: string;
  phone?: string;
  interest_level: number;
  recommended_plan?: string;
  conversation_summary?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [interestFilter, setInterestFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchTerm, statusFilter, interestFilter, leads]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading leads:', error);
        return;
      }

      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(searchTerm) ||
        lead.conversation_summary?.toLowerCase().includes(searchLower) ||
        lead.recommended_plan?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Interest filter
    if (interestFilter !== 'all') {
      if (interestFilter === 'high') {
        filtered = filtered.filter(lead => lead.interest_level >= 7);
      } else if (interestFilter === 'medium') {
        filtered = filtered.filter(lead => lead.interest_level >= 4 && lead.interest_level < 7);
      } else if (interestFilter === 'low') {
        filtered = filtered.filter(lead => lead.interest_level < 4);
      }
    }

    setFilteredLeads(filtered);
  };

  const getInterestColor = (level: number) => {
    if (level >= 7) return 'bg-green-500';
    if (level >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInterestLabel = (level: number) => {
    if (level >= 7) return 'High';
    if (level >= 4) return 'Medium';
    return 'Low';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'bg-green-500';
      case 'qualified': return 'bg-blue-500';
      case 'lost': return 'bg-red-500';
      case 'new': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        return;
      }

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, updated_at: new Date().toISOString() }
          : lead
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    highInterest: leads.filter(l => l.interest_level >= 7).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">Track and manage all sales leads</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{stats.qualified}</p>
                <p className="text-sm text-muted-foreground">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{stats.converted}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-xl font-bold">{stats.highInterest}</p>
                <p className="text-sm text-muted-foreground">High Interest</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={interestFilter} onValueChange={setInterestFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interest</SelectItem>
                <SelectItem value="high">High (7+)</SelectItem>
                <SelectItem value="medium">Medium (4-6)</SelectItem>
                <SelectItem value="low">Low (0-3)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recommended Plan</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {lead.email || 'No email'}
                        </div>
                        {lead.phone && (
                          <div className="text-sm text-muted-foreground">
                            {lead.phone}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Session: {lead.session_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getInterestColor(lead.interest_level)}>
                        {getInterestLabel(lead.interest_level)} ({lead.interest_level}/10)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <Badge className={getStatusColor(lead.status)} variant="secondary">
                            {lead.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.recommended_plan || 'Not set'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {lead.conversation_summary || 'No summary'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}