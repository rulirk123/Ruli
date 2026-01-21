
export interface MaintenanceActivity {
  date: number;
  line: string;
  activity: string;
  machine: string;
  duration: string;
  pic: string;
}

export interface RedTagData {
  month: string;
  masuk: number;
  selesai: number;
  totalMasuk: number;
  totalSelesai: number;
  sisa: number;
  percentage: string;
}

export interface SafetyAdvice {
  id: number;
  text: string;
}
