import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Evento } from '../_models/Evento';
import { EventoService } from '../_services/evento.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css'],
  providers: [EventoService]
})
export class EventosComponent implements OnInit {
  evento: Evento;
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  imagemLargura = 50;
  imagemMargem = 2;
  mostrarImagens = false;
  operacao = '';
  bodyDeletarEvento = '';
  
  // TODO: verificar porque a variável estava gerando erro ao não inicializar
  // (adicionado em tsconfig.json "strictPropertyInitialization": false / "strictNullChecks": false)
  registerForm: FormGroup;
  
  _filtroLista: string = '';
  
  get filtroLista(): string {
    return this._filtroLista;
  }
  
  set filtroLista(value: string) {
    this._filtroLista = value;
    this.eventosFiltrados = this.filtroLista ? this.filtrarEventos(this.filtroLista) : this.eventos;
  }
  
  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService) {
      this.localeService.use('pt-br');
    }

    inserirEvento(template: any) {
      this.operacao = 'post';
      this.openModal(template);
    }

    editarEvento(evento: Evento, template: any) {
      this.operacao = 'put';
      this.openModal(template);
      this.evento = evento;
      this.registerForm.patchValue(evento); // preenche o form
    }
    
    openModal(template: any) {
      this.registerForm.reset();
      template.show();
    }

    openModalExclusao(evento: Evento, template: any) {
      this.openModal(template);
      this.evento = evento;
      this.bodyDeletarEvento = `Tem certeza que deseja excluir o Evento: ${evento.id} - ${evento.tema}`;
    }
    
    ngOnInit() {
      this.validation();
      this.getEventos();
    }
    
    getEventos() {
      this.eventoService.getAllEvento().subscribe(
        (_eventos: Evento[]) => {
          this.eventos = _eventos
          this.eventosFiltrados = this.eventos;
        },
        error => {console.log(error)}
        );
      }
      
      validation() {
        this.registerForm = this.formBuilder.group({
          tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
          local: ['', Validators.required],
          data: ['', Validators.required],
          quantidadePessoas: ['', [Validators.required, Validators.max(120000)]],
          imagemUrl: ['', Validators.required],
          telefone: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
        });
      }
      
      salvarAlteracao(template: any) {
        if (this.registerForm.valid) {
          if (this.operacao === 'post') {
            this.evento = Object.assign({}, this.registerForm.value); // cria uma cópia do objeto
            this.eventoService.postEvento(this.evento).subscribe(
              (novoEvento) => {
                template.hide();
                this.getEventos();
              },
              (error) => {
                console.log(error);
              }
            );
          } else if (this.operacao === 'put') {
            this.evento = Object.assign({id: this.evento.id}, this.registerForm.value); // cria uma cópia do objeto
            this.eventoService.putEvento(this.evento).subscribe(
              () => {
                template.hide();
                this.getEventos();
              },
              (error) => {
                console.log(error);
              }
            );
          }
        }
      }

      excluirEvento(template: any) {
        this.eventoService.deleteEvento(this.evento.id).subscribe(
          () => {
            template.hide();
            this.getEventos();
          },
          (error) => {
            console.log(error);
          }
        );
      }
      
      alternarImagens() {
        this.mostrarImagens = !this.mostrarImagens;
      }
      
      filtrarEventos(filtrarPor: string): Evento[] {
        filtrarPor = filtrarPor.toLocaleLowerCase();
        
        return this.eventos.filter(
          evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
          );
        }
      }
      