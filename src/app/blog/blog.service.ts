import { Injectable } from '@angular/core';
import {Article} from '../classes/articles/article'
import {Keyword} from '../classes/articles/keyword'
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BlogService {

  listArticles : Article[] = [];
  listFavoriteArticles : Article[] = [];
  listKeywords : Keyword[] = [];
  listArticlesSubject = new Subject<Article[]>();
  listFavoriteArticlesSubject = new Subject<Article[]>();
  listKeywordsSubject = new Subject<Keyword[]>();

  baseLink : String;

  constructor(private httpClient: HttpClient) { }

  fillListArticle(){
    this.baseLink = window.location.href.includes("localhost") ? "https://bminddev.firebaseio.com" : "https://test.com";
    if (this.listArticles.length!=0 && this.listFavoriteArticles.length!=0){
      console.log("Liste articles déjà chargée")
      console.log(this.listArticles.length+" articles dont "+this.listFavoriteArticles.length+" en favori")
      this.emitListFavoriteArticlesSubject()
      this.emitListArticlesSubject();
      return;
    }
    this.httpClient.get<any[]>(this.baseLink+'/articles.json').subscribe(
      (response) => {
        var lKeys = Object.keys(response)
        var listObject : Article[] = [];
        lKeys.forEach(function(kw){
          var oneArticle = new Article()
          oneArticle.fromHashMap(response[kw])
          listObject.push(oneArticle)
        })
        this.listArticles = listObject.slice();
        this.fillFavoriteArticles();
        this.emitListArticlesSubject();
      },
      (error) => {
        console.log('Erreur ! : ' + error);
      }
    );
  }

  fillFavoriteArticles(){
    this.httpClient.get<any[]>(this.baseLink+'/favorites.json').subscribe(
      (response) => {
        if (response!=null){
          var listIdFavorite = response
          this.listFavoriteArticles=[]
          for (var k=0; k<this.listArticles.length; k++){
            if(listIdFavorite.indexOf(this.listArticles[k].id)>-1){
              this.listFavoriteArticles.push(this.listArticles[k])
            }
          }
        }
        this.emitListFavoriteArticlesSubject()
      },
      (error) => {
        console.log('Erreur ! : ' + error);
      }
    );
  }

  fillListDefinition(){
    this.httpClient.get<any[]>(this.baseLink+'/keywords.json').subscribe(
      (response) => {
        var lKeys = Object.keys(response)
        var listObject : Keyword[] = [];
        lKeys.forEach(function(kw){
          var oneKw = new Keyword()
          oneKw.fromHashMap(response[kw])
          listObject.push(oneKw)
        })
        this.listKeywords = listObject.slice();
        this.emitListKeywordsSubject();
      },
      (error) => {
        console.log('Erreur ! : ' + error);
      });
  }

  emitListArticlesSubject() {
    this.listArticlesSubject.next(this.listArticles.slice());
  }

  emitListFavoriteArticlesSubject() {
    this.listFavoriteArticlesSubject.next(this.listFavoriteArticles.slice());
  }

  emitListKeywordsSubject(){
    this.listKeywordsSubject.next(this.listKeywords.slice());
  }

  incrementVues(idArticle : Number){

    this.httpClient.get<any[]>(this.baseLink+'/articles.json').subscribe(
      (response) => {
        var lKeys = Object.keys(response)
        var listObject : Article[] = [];
        lKeys.forEach(function(kw){
          var oneArticle = new Article()
          oneArticle.fromHashMap(response[kw])
          listObject.push(oneArticle)
        })
        var listArticlesTempo = listObject.slice();
        for (var k=0; k<listArticlesTempo.length;k++){
          if (listArticlesTempo[k].id==idArticle){
            listArticlesTempo[k].vues=(+listArticlesTempo[k].vues)+1
          }
        }

        this.httpClient.put(this.baseLink+'/articles.json', listArticlesTempo).subscribe(
          () => {
            console.log("La liste d'article a été update pour les vues")
          },
          (error) => {
          }
        );
      },
      (error) => {
        console.log('Erreur ! : ' + error);
      }
    );
  }
}