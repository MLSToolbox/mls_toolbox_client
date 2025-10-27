import { Component, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { AnalysisResponse, AnalyzerType, CodeAnalysisService, ProjectAnalysisResponse } from "@app/core";

@Component({
  selector: "app-code-assess",
  templateUrl: "./code-assess.component.html",
  styleUrl: "./code-assess.component.css",
})
export class CodeAssessComponent implements OnInit {
  // Sidebar state
  sidebarOpen = false;
  
  // Theme state
  isLightTheme = false;
  
  // Analysis data
  analysisData: AnalysisResponse | null = null;
  sessionId: string = '';
  selectedAnalyzers: AnalyzerType[] = ['fpc', 'pfp'];
  
  // Analysis state
  isAnalyzing: boolean = false;
  analysisResults: ProjectAnalysisResponse | null = null;

  constructor(
    private messageService: MessageService,
    private codeAnalysisService: CodeAnalysisService
  ) {}
  
  ngOnInit() {
    // Cargar tema guardado del localStorage
    const savedTheme = localStorage.getItem('code-assess-theme');
    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    }
  }

  // Toggle sidebar (para móviles)
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  // Toggle theme (cambiar entre oscuro y claro)
  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('code-assess-theme', 'light');
      
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('code-assess-theme', 'dark');
      
    }
  }
  
  // Manejar respuesta del análisis inicial (upload)
  onAnalysisComplete(response: AnalysisResponse) {
    this.analysisData = response;
    this.sessionId = response.data.session_id;
    console.log('📊 Datos de análisis recibidos en componente padre:', response);
    console.log('🔑 Session ID guardado:', this.sessionId);
  }
  
  // Verificar si se puede ejecutar análisis
  get canAnalyze(): boolean {
    return !!this.sessionId && !this.isAnalyzing;
  }
  
  // Manejar cambio de tipo de análisis
  onAnalysisTypeChange(analyzers: AnalyzerType[]) {
    this.selectedAnalyzers = analyzers;
    console.log('📋 Analizadores seleccionados actualizados:', analyzers);
  }
  
  // Ejecutar análisis del proyecto
  onRunAnalysis() {
    if (!this.canAnalyze) {
      console.warn('⚠️ No se puede ejecutar el análisis');
      return;
    }
    
    this.isAnalyzing = true;
    console.log('🚀 Iniciando análisis del proyecto...');
    console.log('🔑 Session ID:', this.sessionId);
    console.log('🔍 Analizadores:', this.selectedAnalyzers);
    
    this.codeAnalysisService.analyzeProject(this.sessionId, this.selectedAnalyzers)
      .subscribe({
        next: (response) => {
          this.isAnalyzing = false;
          this.analysisResults = response;
          console.log('✅ Análisis completado:', response);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Analysis Complete',
            detail: 'Project analysis finished successfully',
            life: 3000
          });
        },
        error: (error) => {
          this.isAnalyzing = false;
          console.error('❌ Error en el análisis:', error);
          
          this.messageService.add({
            severity: 'error',
            summary: 'Analysis Failed',
            detail: error.error?.message || 'Failed to analyze project',
            life: 5000
          });
        }
      });
  }
}
