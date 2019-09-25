import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import $ from 'jquery';

import { BlogService } from '../blog.service';
import { GlobalService } from '../../global.service';

import { HttpClient } from '@angular/common/http';

import {Article} from '../../classes/articles/article'
import {Keyword} from '../../classes/articles/keyword'

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  @Input() article : Article;

  isOneWordHovered : Boolean = false;
  styleTooltip : SafeStyle; 
  keywordHovered="Aliquam"
  descHovered="Mauris consequat eros elit, sit amet commodo dui ultricies id. Donec in dapibus ipsum. Phasellus imperdiet, arcu at feugiat consequat."
  corpsArticleFilled : String;
  mapDefinition : any = {};

  listKeywords : Keyword[] = [];
  listKeywordsSubscription: Subscription;

  constructor(private blogService: BlogService, private globalService : GlobalService, private route: ActivatedRoute,private sanitizer : DomSanitizer, private httpClient: HttpClient) { }

  ngOnInit() {
    //On incrémente le nombre de vues
    this.blogService.incrementVues(this.article.id)

    document.body.addEventListener('mouseover', (e) => {
      this.printDescWord((e.target as HTMLTextAreaElement).id);
    });

    this.listKeywordsSubscription = this.blogService.listKeywordsSubject.subscribe(
      (listKeywords: any[]) => {
        this.listKeywords = listKeywords;
        this.fillMapDefinition(); 
      }
    );
    this.blogService.emitListKeywordsSubject();
    this.fillMapDefinition();
    this.generateCorpsArticle()
  }

  openPopup(keyOrigin : String){
    this.globalService.managePopup(keyOrigin);
  }

  printDescWord(wordId : String){
    if(wordId!="" && wordId.startsWith("word")){
      //déplacement du tooltip
      var wordKey = wordId.split("-")[1]
      var topValue = $("#"+wordId)[0].offsetTop+26
      var leftValue = $("#"+wordId)[0].offsetLeft-153
      this.styleTooltip=this.sanitizer.bypassSecurityTrustStyle("left:"+leftValue+"px; top:"+topValue+"px;")
      //maj mot et def
      this.keywordHovered=wordKey.substring(0,1).toUpperCase()+wordKey.substring(1,wordKey.length)
      this.descHovered=this.mapDefinition[""+wordKey]
      this.isOneWordHovered=true 
    } else{
      this.isOneWordHovered=false;
    }
    
  }

  fillMapDefinition(){
    if (Object.keys(this.mapDefinition).length>0){
      return;
    }
    if (this.listKeywords.length!=0){
      for (var k=0; k<this.listKeywords.length;k++){
        var kw = this.listKeywords[k]
        this.mapDefinition[""+kw.key.toLowerCase()]=kw.def
      }
    } else {
      setTimeout(()=>{this.fillMapDefinition()},100)
    }
  }

  generateCorpsArticle(){
    var wordsToFind = []
    for (var k=0; k<Object.keys(this.mapDefinition).length; k++){
      var word = Object.keys(this.mapDefinition)[k]
      if (this.article.fullText.includes(" "+word+" ") || this.article.fullText.includes(" "+word+".") || this.article.fullText.includes(" "+word+".")){
        wordsToFind.push(word)
      }
    }

    var regex2 = /([A-z]|[a-z]){2,}/gi;
    
    var stringCorps = "";
    var listWords = this.article.fullText.split(" ")
    for (var k=0; k<listWords.length; k++){
      var oneWord = ""
      if(listWords[k].match(regex2)!=null){
        oneWord =  listWords[k].match(regex2)[0]
      }

      if (wordsToFind.indexOf(oneWord.toLowerCase())>-1){
        wordsToFind=wordsToFind.splice(0,wordsToFind.indexOf(oneWord.toLowerCase())).concat(wordsToFind.splice(wordsToFind.indexOf(oneWord.toLowerCase())+1,wordsToFind.length));
        var newWtf = []
        for (var i=0; i<wordsToFind.length;i++){
          if(wordsToFind[i]!=oneWord.toLowerCase()){
            newWtf.push(wordsToFind[i])
          }
        }
        wordsToFind = newWtf.slice()
        var stringReplacement = "<b class='descWord' id='word-"+oneWord.toLowerCase()+"'>"+oneWord+"</b>"
        stringCorps+= listWords[k].replace(""+oneWord, stringReplacement)+" "
      } else {
        stringCorps+=listWords[k]+" "
      }
    }
    this.corpsArticleFilled = stringCorps;

    /*var wordsToFind = Object.keys(this.mapDefinition)
    var stringCorps = this.article.fullText;
    for (var k=0; k<wordsToFind.length; k++){
      if (this.article.fullText.includes(" "+wordsToFind[k]+" ")){
        var stringReplacement = "<b class='descWord' id='word-"+wordsToFind[k]+"'>"+wordsToFind[k]+"</b>"
        stringCorps =stringCorps.replace(""+wordsToFind[k], stringReplacement)
      }
    }

    this.corpsArticleFilled = stringCorps;*/
  }
}