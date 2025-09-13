import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { WorkRecord, WorkStatus } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { loadWorkRecords, saveWorkRecords } from '@/lib/localStorage';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { calculateWorkMinutes, calculateEarnings } from '@/lib/timeCalculations';

const editWorkRecordSchema = z.object({
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  status: z.enum(['not_started', 'working', 'on_break', 'finished']),
});

type EditWorkRecordForm = z.infer<typeof editWorkRecordSchema>;

export default function HistoryDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch specific work record
  const { data: record, isLoading } = useQuery({
    queryKey: ['/api/records', id],
    queryFn: async () => {
      try {
        // Try API first
        const response = await fetch(`/api/records/${id}`);
        if (response.ok) {
          const record = await response.json();
          return {
            ...record,
            clockIn: record.clockIn ? new Date(record.clockIn) : undefined,
            clockOut: record.clockOut ? new Date(record.clockOut) : undefined,
            breakStart: record.breakStart ? new Date(record.breakStart) : undefined,
            breakEnd: record.breakEnd ? new Date(record.breakEnd) : undefined,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          };
        }
        throw new Error('API not available');
      } catch {
        // Fallback to localStorage
        const localRecords = loadWorkRecords();
        return localRecords.find(r => r.id === id);
      }
    },
    enabled: !!id,
  });

  // Get settings for earnings calculation
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          return await response.json();
        }
        throw new Error('API not available');
      } catch {
        return {
          id: 'main',
          hourlyRate: 3000,
          overtimeRate: 3750,
          targetHoursPerDay: 480,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }
  });

  // Form setup
  const form = useForm<EditWorkRecordForm>({
    resolver: zodResolver(editWorkRecordSchema),
    defaultValues: {
      clockIn: '',
      clockOut: '',
      breakStart: '',
      breakEnd: '',
      status: 'not_started',
    },
  });

  // Set form values when record is loaded
  useEffect(() => {
    if (record) {
      form.reset({
        clockIn: record.clockIn ? format(record.clockIn, 'HH:mm') : '',
        clockOut: record.clockOut ? format(record.clockOut, 'HH:mm') : '',
        breakStart: record.breakStart ? format(record.breakStart, 'HH:mm') : '',
        breakEnd: record.breakEnd ? format(record.breakEnd, 'HH:mm') : '',
        status: record.status,
      });
    }
  }, [record, form]);

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async (data: Partial<WorkRecord>) => {
      try {
        const response = await apiRequest('PATCH', `/api/records/${id}`, data);
        return await response.json();
      } catch {
        // Fallback to localStorage
        const records = loadWorkRecords();
        const updatedRecords = records.map(rec => 
          rec.id === id 
            ? { ...rec, ...data, updatedAt: new Date() }
            : rec
        );
        saveWorkRecords(updatedRecords);
        return updatedRecords.find(r => r.id === id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      toast({
        title: "更新完了",
        description: "勤務記録が正常に更新されました。",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "更新エラー",
        description: "勤務記録の更新に失敗しました。",
      });
    }
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest('DELETE', `/api/records/${id}`);
      } catch {
        // Fallback to localStorage
        const records = loadWorkRecords();
        const updatedRecords = records.filter(rec => rec.id !== id);
        saveWorkRecords(updatedRecords);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      toast({
        title: "削除完了",
        description: "勤務記録が削除されました。",
      });
      setLocation('/history');
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "削除エラー",
        description: "勤務記録の削除に失敗しました。",
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  const getStatusBadge = (status: WorkStatus) => {
    switch (status) {
      case 'finished':
        return <Badge variant="default" className="bg-clock-out text-white">完了</Badge>;
      case 'working':
        return <Badge variant="default" className="bg-clock-in text-white">勤務中</Badge>;
      case 'on_break':
        return <Badge variant="default" className="bg-break-start text-white">休憩中</Badge>;
      default:
        return <Badge variant="secondary">未開始</Badge>;
    }
  };

  const parseTimeString = (timeStr: string, baseDate: string): Date | undefined => {
    if (!timeStr || !baseDate) return undefined;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    
    try {
      // Handle YYYY-MM-DD format properly
      const dateStr = baseDate.includes('T') ? baseDate : baseDate + 'T00:00:00';
      const newDate = new Date(dateStr);
      if (isNaN(newDate.getTime())) return undefined;
      
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    } catch (error) {
      console.error('Parse time string error:', error);
      return undefined;
    }
  };

  const onSubmit = (data: EditWorkRecordForm) => {
    if (!record || !settings) return;

    const baseDate = record.date;
    const clockIn = parseTimeString(data.clockIn!, baseDate);
    const clockOut = parseTimeString(data.clockOut!, baseDate);
    const breakStart = parseTimeString(data.breakStart!, baseDate);
    const breakEnd = parseTimeString(data.breakEnd!, baseDate);

    // Calculate break duration
    let totalBreakMinutes = 0;
    if (breakStart && breakEnd) {
      totalBreakMinutes = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 1000 / 60);
    }

    // Calculate work minutes and earnings
    let totalWorkMinutes = 0;
    let earnings = 0;
    if (clockIn && clockOut) {
      totalWorkMinutes = calculateWorkMinutes(clockIn, clockOut, totalBreakMinutes);
      earnings = calculateEarnings(totalWorkMinutes, settings.hourlyRate, settings.overtimeRate);
    }

    const updates: Partial<WorkRecord> = {
      clockIn,
      clockOut,
      breakStart,
      breakEnd,
      totalBreakMinutes,
      totalWorkMinutes,
      earnings,
      status: data.status,
    };

    updateRecordMutation.mutate(updates);
  };

  const handleDelete = () => {
    if (window.confirm('この勤務記録を削除してもよろしいですか？')) {
      deleteRecordMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">勤務記録が見つかりません</p>
          <Button onClick={() => setLocation('/history')} data-testid="button-back-to-history">
            履歴に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12">
      <div className="max-w-2xl mx-auto pt-6 space-y-6 lg:max-w-5xl lg:pt-8 xl:pt-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation('/history')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              勤務記録詳細
            </h1>
            <p className="text-sm text-muted-foreground">
              {record.date ? (() => {
                try {
                  // Handle YYYY-MM-DD format
                  const dateStr = record.date.includes('T') ? record.date : record.date + 'T00:00:00';
                  return format(new Date(dateStr), 'yyyy年M月d日(E)', { locale: ja });
                } catch (error) {
                  console.error('Date formatting error:', error, 'Date value:', record.date);
                  return record.date;
                }
              })() : '日付不明'}
            </p>
          </div>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                現在の状況
              </span>
              {getStatusBadge(record.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">実働時間:</span>
                <p className="font-medium">{formatDuration(record.totalWorkMinutes)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">収益:</span>
                <p className="font-medium">{formatCurrency(record.earnings)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">休憩時間:</span>
                <p className="font-medium">{formatDuration(record.totalBreakMinutes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>記録を編集</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clockIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>出勤時刻</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            data-testid="input-clock-in"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clockOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>退勤時刻</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            data-testid="input-clock-out"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="breakStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>休憩開始時刻</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            data-testid="input-break-start"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breakEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>休憩終了時刻</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            data-testid="input-break-end"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ステータス</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="ステータスを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_started">未開始</SelectItem>
                          <SelectItem value="working">勤務中</SelectItem>
                          <SelectItem value="on_break">休憩中</SelectItem>
                          <SelectItem value="finished">完了</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteRecordMutation.isPending}
                    data-testid="button-delete-record"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={updateRecordMutation.isPending}
                    data-testid="button-save-record"
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateRecordMutation.isPending ? '保存中...' : '保存'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}