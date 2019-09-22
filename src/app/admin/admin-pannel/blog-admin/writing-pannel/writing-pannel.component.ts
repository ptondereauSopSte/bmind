import { Component, OnInit, Input } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../admin.service';

import {Article} from '../../../../classes/articles/article'
import {Source} from '../../../../classes/articles/source'
import {Auteur} from '../../../../classes/articles/auteur'

@Component({
  selector: 'app-writing-pannel',
  templateUrl: './writing-pannel.component.html',
  styleUrls: ['./writing-pannel.component.scss']
})
export class WritingPannelComponent implements OnInit {

  @Input() isEdit : Boolean;
  @Input() articleToEdit : Article;

  newArticle : Article = new Article();
  editor = ClassicEditor;

  listType = ["Projet", "Actualité", "Revue"]
  listTime = ["2min", "5 min","10 min","30 min", "1 heure"]
  listDifficulte = [1,2,3,4,5]

  newSource : Source = new Source();
  newAutor : Auteur = new Auteur();
  newSector : String = new String();

  isAddSource : Boolean = false;
  isAddAuteur : Boolean = false;
  isAddSector : Boolean = false;

  fullListAutor : Auteur[];
  fullListArticle : Article[];
  displayedListArticle : Article[][] = [];
  lastIdAutor : Number;
  lastIdArticle : Number;
  mapCheckBox : any = {};

  articlesSelected : Article[] = [];
  isAddingArticle : Boolean = false;
  filterTextNav : String = new String();

  isPosted : Boolean = false;

  constructor(private httpClient: HttpClient, private adminService : AdminService) { }

  ngOnInit() {
    if (!this.isEdit){
      this.newArticle.type=this.listType[0]
      this.newArticle.time=this.listTime[0]
      this.newArticle.difficulte=this.listDifficulte[0]
      this.newArticle.listAuteurs = [];
      this.newArticle.listSectors = [];
      this.newArticle.listSectors = [];
    } else {
      this.newArticle=this.articleToEdit
    }
    

    this.fillData(['autors', 'articles'])
  }

  write(){
    this.newArticle.id=(+this.lastIdArticle)+1
    this.lastIdArticle = (+this.lastIdArticle)+1
    this.newArticle.vues=0;

    //AJOUT BASE
    this.httpClient.post('https://bminddev.firebaseio.com/articles.json', this.newArticle).subscribe(
      () => {
        console.log('Enregistrement de l\'article terminé !');
        this.isPosted = true
        this.newArticle=new Article();
        this.fillData(['autors'])
        setTimeout( ()=>{this.isPosted=false},3000)
      },
      (error) => {
        console.log('Erreur lors de l\'enregistrment de l\'article! : ' + error);
      }
    );
  }

  edit(){

    //Modif BASE
    var newListArticle = []
    for (var k=0; k<this.fullListArticle.length;k++){
      if (!(this.fullListArticle[k].id==this.articleToEdit.id)){
        newListArticle.push(this.fullListArticle[k])
      } else{
        newListArticle.push(this.newArticle)
      }
    }
    console.log(newListArticle)
    this.httpClient.put('https://bminddev.firebaseio.com/articles.json', newListArticle).subscribe(
      () => {
        console.log('Edition de l\'article terminée !');
        this.adminService.switchEditingMode()
      },
      (error) => {
        console.log('Erreur lors de l\'enregistrment de l\'article! : ' + error);
      }
    );
  }

  openAdd(keyList : String){
    if (keyList==='source'){
      this.isAddSource=true;
    } else if (keyList==='auteur'){
      this.isAddAuteur=true;
    } else if (keyList==='sector'){
      this.isAddSector=true;
    }
  }
  closeAdd(keyList : String){
    if (keyList==='source'){
      this.isAddSource=false;
    } else if (keyList==='auteur'){
      this.isAddAuteur=false;
    } else if (keyList==='sector'){
      this.isAddSector=false;
    }
  }

  addItemToLists(keyList : String){
    if (keyList==='source'){
      console.log(this.newSource)
      this.newArticle.listSources.push(this.newSource)
      this.newSource = new Source()
      this.isAddSource=false;
    } else if (keyList==='auteur'){
      //On doit ajouter à la liste plus haut, le mettre dans la map et le cocher
      this.newAutor.id = (+this.lastIdAutor)+1
      this.lastIdAutor = (+this.lastIdAutor)+1
      
      this.mapCheckBox[""+this.newAutor.id]=true
      this.fullListAutor.push(this.newAutor)

      this.newAutor = new Auteur()
    } else if (keyList==='secteur'){
      this.newArticle.listSectors.push(this.newSector)
      this.newSector = new String()
      this.isAddSector=false;
    }
  }

  removeItem(keyList : String, entry : any){
    if (keyList==='source'){
      var newListSources = []
      for (var k=0; k<this.newArticle.listSources.length;k++){
        if (this.newArticle.listSources[k]!=entry){
          newListSources.push(this.newArticle.listSources[k])
        }
      }
      this.newArticle.listSources = newListSources.slice()
    } else if (keyList==='auteur'){
      var newListAuteurs = []
      for (var k=0; k<this.newArticle.listAuteurs.length;k++){
        if (this.newArticle.listAuteurs[k]!=entry){
          newListAuteurs.push(this.newArticle.listAuteurs[k])
        }
      }
      this.newArticle.listAuteurs = newListAuteurs.slice()

    } else if (keyList==='secteur'){
      var newListSectors = []
      for (var k=0; k<this.newArticle.listSectors.length;k++){
        if (this.newArticle.listSectors[k]!=entry){
          newListSectors.push(this.newArticle.listSectors[k])
        }
      }

      this.newArticle.listSectors = newListSectors.slice()
    }
  }

  validateCheckbox(keyList : String){
    if (keyList==='auteur'){
      for (var k=0; k<this.fullListAutor.length; k++){
        if(this.mapCheckBox[""+this.fullListAutor[k].id]==true){
          var alreadyIn=false;
          for (var i=0; i<this.newArticle.listAuteurs.length; i++){
            if(this.newArticle.listAuteurs[i].id==this.fullListAutor[k].id){
              alreadyIn=true; 
            }
          }
          if (!alreadyIn){
            this.newArticle.listAuteurs.push(this.fullListAutor[k])
          }
        }
      }
    }
    this.isAddAuteur=false;
    for (var k=0; k<this.fullListAutor.length; k++){
      this.mapCheckBox[""+this.fullListAutor[k].id]=false
    }
  }

  openPopupAddArticle(){
    this.isAddingArticle=true;
  }

  closeAddArticle(){
    this.isAddingArticle=false;
  }

  selectArticle(article : Article){
    this.articlesSelected.push(article)
    this.newArticle.listIdArticlesLies.push(article.id)
    this.isAddingArticle=false;
    this.filterTextNav = new String();
    this.refreshDisplayedArticle()
  }

  deleteArticle(article : Article){
    var newListId = []
    var newListSelectedArticle = []
    for(var k=0; k<this.newArticle.listIdArticlesLies.length;k++){
      if(this.newArticle.listIdArticlesLies[k]!=article.id){
        newListId.push(this.newArticle.listIdArticlesLies[k])
      }
    }
    for(var k=0; k<this.articlesSelected.length;k++){
      if(this.articlesSelected[k].id!=article.id){
        newListSelectedArticle.push(this.articlesSelected[k])
      }
    }
    this.newArticle.listIdArticlesLies = newListId.slice()
    this.articlesSelected = newListSelectedArticle.slice()

    this.refreshDisplayedArticle()
  }

  refreshDisplayedArticle(){
    this.displayedListArticle = []
    var index=0
    var rowArticle : Article[] = []
    for (var k=0; k<this.fullListArticle.length; k++){
      if(this.newArticle.listIdArticlesLies.indexOf(this.fullListArticle[k].id)==-1 && this.fullListArticle[k].title.toLowerCase().startsWith(this.filterTextNav.toLowerCase())){
        if (index==3){
          this.displayedListArticle.push(rowArticle)
          rowArticle = []
          rowArticle.push(this.fullListArticle[k])
        } else {
          rowArticle.push(this.fullListArticle[k])
        }
        index++;
      }
    }
    if (index!=0){
      this.displayedListArticle.push(rowArticle)
    }
  }


  fillData(toBeRereshed : String[]){
    if (toBeRereshed.indexOf('autors')>-1){
      this.httpClient.get<any[]>('https://bminddev.firebaseio.com/autors.json').subscribe(
        (response) => {
          var lKeys = Object.keys(response)
          var listObject : Auteur[] = [];
          lKeys.forEach(function(kw){
            var oneAutor = new Auteur()
            oneAutor.fromHashMap(response[kw])
            listObject.push(oneAutor)
          })
          this.fullListAutor = listObject.slice();
          this.lastIdAutor = 0;
          for (var k=0; k<this.fullListAutor.length; k++){
            this.lastIdAutor=+Math.max(Number(this.lastIdAutor),Number(this.fullListAutor[k].id))
            this.mapCheckBox[""+this.fullListAutor[k].id]=false
          }
        },
        (error) => {
          console.log('Erreur ! : ' + error);
        }
      );
    }

    if (toBeRereshed.indexOf('articles')>-1){
      this.httpClient.get<any[]>('https://bminddev.firebaseio.com/articles.json').subscribe(
        (response) => {
          var lKeys = Object.keys(response)
          var listObject : Article[] = [];
          lKeys.forEach(function(kw){
            var oneArticle = new Article()
            oneArticle.fromHashMap(response[kw])
            listObject.push(oneArticle)
          })
          this.fullListArticle = listObject.slice();
          this.lastIdArticle = 0;
          for (var k=0; k<this.fullListArticle.length; k++){
            this.lastIdArticle=+Math.max(Number(this.lastIdArticle),Number(this.fullListArticle[k].id))
          }
          var index=0
          var rowArticle : Article[] = []
          for (var k=0; k<this.fullListArticle.length; k++){
            if (index==3){
              this.displayedListArticle.push(rowArticle)
              rowArticle = []
              rowArticle.push(this.fullListArticle[k])
            } else {
              rowArticle.push(this.fullListArticle[k])
            }
            index++;
          }
          if (index!=0){
            this.displayedListArticle.push(rowArticle)
          }
          //Si on est en edit on va aller chercher les articles liés
          if(this.isEdit)
          this.articlesSelected = [];
          for (var k=0; k<this.fullListArticle.length; k++){
            if (this.newArticle.listIdArticlesLies.indexOf(this.fullListArticle[k].id)>-1){
              this.articlesSelected.push(this.fullListArticle[k])
            }
          }
        },
        (error) => {
          console.log('Erreur ! : ' + error);
        }
      );
    }
  }
}