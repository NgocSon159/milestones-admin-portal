import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { Search, Clock } from 'lucide-react';

export function HistoryLog() {
  const { historyLogs } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = historyLogs.filter(log => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.requestId && log.requestId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || 
      log.action.toLowerCase().includes(actionFilter.toLowerCase());
    
    return matchesSearch && matchesAction;
  });

  const getActionType = (action: string) => {
    if (action.includes('Approved')) return { type: 'approved', color: 'bg-green-100 text-green-800' };
    if (action.includes('Rejected')) return { type: 'rejected', color: 'bg-red-100 text-red-800' };
    if (action.includes('Added')) return { type: 'added', color: 'bg-blue-100 text-blue-800' };
    return { type: 'other', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Request History Log
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track all actions performed by admin users
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by admin name, action, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="added">Added Miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin Name</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const actionInfo = getActionType(log.action);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.adminName}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={log.action}>
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>
                      {log.requestId ? (
                        <span className="font-mono text-sm">{log.requestId}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionInfo.color}>
                        {actionInfo.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No history logs found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}

    </div>
  );
}