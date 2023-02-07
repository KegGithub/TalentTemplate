// ==UserScript==
// @name         Talent Info Collection
// @namespace    https://github.com/KegGithub
// @version      0.9.1
// @description  搜索全网人才各个维度的信息并收录到人才画像中（已完成LinkedIn, ORCID, GoogleScholar, ResearchGate的网站匹配）
// @author       YSU Knowledge Engineering Group
// @match        *://www.linkedin.com/*
// @match        *://orcid.org/*
// @match        *://scholar.google.com/citations*
// @match        *://www.researchgate.net/*
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        window.close
// @grant        window.focus
// @grant        window.onurlchange
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @noframes     directive
// @connect      127.0.0.1
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/KegGithub/TalentTemplate/main/TIC.user.js
// @downloadURL  https://raw.githubusercontent.com/KegGithub/TalentTemplate/main/TIC.user.js
// @supportURL   https://github.com/KegGithub/TalentTemplate/issues
// @icon         https://raw.githubusercontent.com/KegGithub/TalentTemplate/main/tic_logo.png
// @resource     boxicons https://cdnjs.cloudflare.com/ajax/libs/boxicons/2.1.4/css/boxicons.min.css
// @license      GPL-3.0-only
// @copyright    2021-2023, ysuKEG
// ==/UserScript==



const DOMAIN = document.domain
const URL = document.URL
let RES = undefined
const SitesAbbr = ['LinkedIn', 'ORCID', 'GoogleScholar', 'ResearchGate']
const WebSites = ['www.linkedin.com', 'orcid.org', 'scholar.google.com', 'www.researchgate.net']

const LinkedIn_TextInfoBox = `
    <p class="SourceTextTitle">LinkedIn</p>
    <div id="TalentNameDIV" class="TalentTextDiv">
        <p id="TalentNameTitle" class="TextTitle">人才名称</p>
    </div>
    <div id="TalentLocationDIV" class="TalentTextDiv">
        <p id="TalentLocationTitle" class="TextTitle">国家地区</p>
    </div>
    <div id="TalentExperimentDIV" class="TalentTextDiv">
        <p id="TalentAffiliationTitle" class="TextTitle">工作经历</p>
    </div>
    <div id="TalentEducationDIV" class="TalentTextDiv">
        <p id="TalentEducationTitle" class="TextTitle">教育经历</p>
    </div>
`

const ORCID_TextInfoBox = `
    <p class="SourceTextTitle">ORCID</p>
    <div id="TalentNameDIV" class="TalentTextDiv">
        <p id="TalentNameTitle" class="TextTitle">人才名称</p>
    </div>
    <div id="TalentLocationDIV" class="TalentTextDiv">
        <p id="TalentLocationTitle" class="TextTitle">国家地区</p>
    </div>
    <div id="TalentExperimentDIV" class="TalentTextDiv">
        <p id="TalentAffiliationTitle" class="TextTitle">工作经历</p>
    </div>
    <div id="TalentEducationDIV" class="TalentTextDiv">
        <p id="TalentEducationTitle" class="TextTitle">教育经历</p>
    </div>
`

const GoogleScholar_TextInfoBox = `
    <p class="SourceTextTitle">Google Scholar</p>
    <div id="TalentNameDIV" class="TalentTextDiv">
        <p id="TalentNameTitle" class="TextTitle">人才名称</p>
    </div>
    <div id="TalentAffiliationDIV" class="TalentTextDiv">
        <p id="TalentAffiliationTitle" class="TextTitle">隶属机构</p>
    </div>
    <div id="TalentSpecializationDIV" class="TalentTextDiv">
        <p id="TalentSpecializationTitle" class="TextTitle">专业领域</p>
    </div>
`

const ResearchGate_TextInfoBox = `
    <p class="SourceTextTitle">ResearchGate</p>
    <div id="TalentNameDIV" class="TalentTextDiv">
        <p id="TalentNameTitle" class="TextTitle">人才名称</p>
    </div>
    <div id="TalentLocationDIV" class="TalentTextDiv">
        <p id="TalentLocationTitle" class="TextTitle">国家地区</p>
    </div>
    <div id="TalentExperienceDIV" class="TalentTextDiv">
        <p id="TalentExperienceTitle" class="TextTitle">隶属机构</p>
    </div>
    <div id="TalentEducationDIV" class="TalentTextDiv">
        <p id="TalentEducationTitle" class="TextTitle">教育经历</p>
    </div>
`

const TiC_HTML = `
    <header>
        <div class="image-text">
            <span class="image">
                <img src="data:image/png;base64,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" alt="icon">
            </span>

            <div class="text logo-text">

                <span class="name">Talent Info Collection (TiC)</span>
                <span class="profession">人才信息采集插件 v1.0</span>
            </div>
        </div>

        <i class='bx bx-chevron-right toggle'></i>
    </header>

    <div class="menu-bar">
        <div class="menu">

            <ul class="menu-links">
                <li class="nav-link">
                    <a id="ParseButton">
                        <i class='bx bx-download icon'></i>
                        <span class="text nav-text">解析当前人才页面</span>
                    </a>
                    <div id="ParseInform">
                        <span id="SuccessParse" class="HaveDoneText" style="display: none;">解析成功</span>
                        <span id="CanParse" class="BeDoing" style="display: none;">可以解析</span>
                        <span id="CannotParse" class="BeDoing" style="display: none;">不可解析</span>
                        <span id="IsParsing" class="BeDoing" style="display: none;">正在解析</span>
                        <span id="FailureParse" class="HaveDoneText" style="display: none">解析失败</span>
                        <span id="TimeoutParse" class="HaveDoneText" style="display: none">解析超时</span>
                    </div>
                </li>

                <li class="nav-link">
                    <i class='bx bx-universal-access icon' ></i>
                    <span class="text nav-text">当前人才基本信息</span>
                    <span class="BeDoing">暂无信息</span>
                </li>

                <div id="TalentInfoText" class="TalentInfoText"></div>
            </ul>

            <ul class="menu-links">
                <li id="LinkedIn_List" class="nav-link">
                    <i class='bx bx-home-alt icon'></i>
                    <span class="text each nav-text">LinkedIn</span>
                    <a href="https://www.linkedin.com/search/results/people/?keywords=" target="_blank">
                        <i class='bx bx-search icon'></i>
                    </a>
                    <a><i class='icon'></i></a>
                    <a class="mode">
                        <div id="ParsedLinkedIn" class="toggle-switch">
                            <span class="switch"></span>
                        </div>
                    </a>
                </li>

                <li id="ORCID_List" class="nav-link">
                    <i class='bx bx-home-alt icon'></i>
                    <span class="text each nav-text">ORCID</span>
                    <a href="https://orcid.org/orcid-search/search" target="_blank">
                        <i class='bx bx-search icon'></i>
                    </a>
                    <a><i class='icon'></i></a>
                    <a class="mode">
                        <div id="ParsedORCID" class="toggle-switch">
                            <span class="switch"></span>
                        </div>
                    </a>
                </li>

                <li id="GoogleScholar_List" class="nav-link">
                    <i class='bx bx-home-alt icon'></i>
                    <span class="text each nav-text">Google Scholar</span>
                    <a href="https://scholar.google.com/citations?view_op=search_authors" target="_blank">
                        <i class='bx bx-search icon'></i>
                    </a>
                    <a href="#"><i class='icon'></i></a>
                    <a class="mode">
                        <div id="ParsedGoogleScholar" class="toggle-switch">
                            <span class="switch"></span>
                        </div>
                    </a>
                </li>
                
                <li id="ResearchGate_List" class="nav-link">
                    <i class='bx bx-home-alt icon'></i>
                    <span class="text each nav-text">ResearchGate</span>
                    <a href="https://www.researchgate.net/search.Search.html?type=researcher&query=" target="_blank">
                        <i class='bx bx-search icon'></i>
                    </a>
                    <a href="#"><i class='icon'></i></a>
                    <a class="mode">
                        <div id="ParsedResearchGate" class="toggle-switch">
                            <span class="switch"></span>
                        </div>
                    </a>
                </li>
                
            </ul>
        </div>

        <div class="bottom-content">
        
            <li class="">
                <a id="ViewButton">
                    <i class='bx bx-book-reader icon'></i>
                    <span class="text nav-text">查看所有解析数据</span>
                </a>
            </li>

            <li class="">
                <a id="SaveButton">
                    <i class='bx bx-save icon'></i>
                    <span class="text nav-text">一键保存人才信息</span>
                </a>
                <div id="SaveInform">
                    <span id="SuccessSave" class="HaveDoneText" style="display: none;">保存成功</span>
                    <span id="FailSave" class="HaveDoneText" style="display: none;">保存失败</span>
                </div>
            </li>

            <li class="">
                <a id="ClearButton">
                    <i class='bx bx-error icon'></i>
                    <span class="text nav-text">清除所有缓存信息</span>
                </a>
                <span id="SuccessClear" class="HaveDoneText">清除成功</span>
            </li>

        </div>
    </div>
`

const TiC_CSS = `
    .TiC_sidebar * {
        margin: 0;
        padding: 0 !important;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif !important;
    }
    
    :root {
        --body-color: #ebf2fd;
        --main-color: #1E90FF;
        --sidebar-color: #EBF2FD;
        --primary-color: #695CFE;
        --primary-color-light: #F6F5FF;
        --toggle-color: #DDD;
        --text-color: #707070;
        --inform-color: #F5190F;
    
        --tran-03: all 0.1s ease;
        --tran-04: all 0.2s ease;
        --tran-05: all 0.3s ease;
    }
    
    ::selection {
        background-color: var(--primary-color);
        color: #fff;
    }
    
    body.dark {
        --toggle-color: var(--primary-color);
    }
    
    #ORCID_List.dark,
    #LinkedIn_List.dark,
    #GoogleScholar_List.dark,
    #ResearchGate_List.dark {
        --toggle-color: var(--primary-color);
    }
    
    .TiC_sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100% !important;
        width: 330px !important;
        padding: 10px 14px;
        background: var(--sidebar-color);
        transition: var(--tran-05);
        z-index: 9999;
    }
    
    .TiC_sidebar.close {
        width: 0 !important;
        background-color: var(--sidebar-color) !important;
    }
    
    .TiC_sidebar li {
        height: 50px;
        list-style: none;
        display: flex;
        align-items: center;
        margin-top: 10px;
    }
    
    .TalentInfoText {
        display: none;
        margin: 5px 10px 5px 10px;
        font-weight: lighter;
        font-size: 16px;
        text-align: left;
        line-height: 112% !important;
        letter-spacing: 0;
    }
    
    .WrapTalentText {
        padding: 0 5px 0 5px !important;
        border: 1px solid lightgray;
        margin-bottom: 1px !important;
    }
    
    .SourceTextTitle {
        font-size: 18px;
        font-weight: bold;
        color: var(--inform-color);
    }
    
    .TalentTextDiv {
        display: none;
    }
    
    .TalentInfoText p{
        margin-top: 12px;
        margin-bottom: 12px;
    }
    
    .TalentInfoText .TextTitle {
        font-weight: bold;
        color: var(--primary-color);
        margin-top: 8px;
        margin-bottom: 8px;
    }
    
    .TiC_sidebar header .image,
    .TiC_sidebar .icon {
        min-width: 60px;
        border-radius: 6px;
    }
    
    .TiC_sidebar .icon {
        min-width: 60px;
        border-radius: 6px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }
    
    .TiC_sidebar .text,
    .TiC_sidebar .icon {
        color: var(--text-color);
        transition: var(--tran-03);
    }
    
    .TiC_sidebar .text {
        font-size: 17px !important;
        font-weight: 500 !important;
        white-space: nowrap;
        margin-left: 0;
        min-width: 160px !important;
        max-width: 160px !important;
        opacity: 1;
        cursor: pointer !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
    
    .TiC_sidebar .text.each {
        min-width: 150px !important;
    }
    
    .BeDoing {
        display: none;
        font-size: 17px;
        font-weight: 600;
        white-space: nowrap;
        margin-left: 10px;
        min-width: 100px;
        opacity: 1;
        color: var(--primary-color);
    }
    
    .HaveDoneText {
        display: none;
        font-size: 17px;
        font-weight: 600;
        white-space: nowrap;
        margin-left: 10px;
        min-width: 100px;
        opacity: 1;
        color: var(--inform-color);
    }
    
    .TiC_sidebar.close header .image-text {
        display: none !important;
        opacity: 0 !important;
    }
    
    .TiC_sidebar header {
        position: relative;
    }
    
    .TiC_sidebar header .image-text {
        opacity: 1 !important;
        display: flex !important;
        align-items: center;
    }
    
    .TiC_sidebar header .logo-text {
        display: flex;
        flex-direction: column;
    }
    
    header .image-text .name {
        margin-top: 2px;
        font-size: 18px;
        font-weight: 600;
    }
    
    header .image-text .profession {
        font-size: 16px;
        margin-top: -2px;
        display: block;
    }
    
    .TiC_sidebar header .image {
        display: flex !important;
        align-items: center;
        justify-content: center;
    }
    
    .TiC_sidebar header .image img {
        display: flex;
        width: 40px;
        border-radius: 6px;
    }
    
    .TiC_sidebar header .toggle {
        position: absolute;
        top: 55px !important;
        right: -25px;
        transform: translateY(-50%) rotate(180deg);
        height: 25px;
        width: 25px;
        background-color: var(--primary-color);
        color: var(--sidebar-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        cursor: pointer;
        transition: var(--tran-05);
    }
    
    .TiC_sidebar.close .toggle {
        top: 55px !important;
        transform: translateY(-50%) rotate(0deg);
    }
    
    .TiC_sidebar .menu {
        margin-top: 20px;
    }
    
    .TiC_sidebar li a {
        list-style: none;
        height: 100% !important;
        background-color: transparent;
        display: flex;
        align-items: center;
        /*width: 100%;*/
        border-radius: 6px;
        text-decoration: none;
        transition: var(--tran-03);
    }
    
    .TiC_sidebar li a:hover {
        background-color: var(--primary-color);
    }
    
    .TiC_sidebar li a:hover .icon,
    .TiC_sidebar li a:hover .text {
        color: var(--sidebar-color);
    }
    
    .TiC_sidebar .menu-bar {
        height: calc(100% - 55px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow-y: scroll;
        scrollbar-width: none;
    }
    
    .menu-bar::-webkit-scrollbar {
        display: none;
    }
    
    .TiC_sidebar .menu-bar .mode{
        border-radius: 6px;
        background-color: var(--primary-color-light);
        position: relative;
        transition: var(--tran-05);
    }
    
    .menu-bar .mode .sun-moon{
        height: 50px;
        width: 60px;
    }
    
    .mode .sun-moon i{
        position: absolute;
    }
    .mode .sun-moon i.sun{
        opacity: 0;
    }
    
    .menu-bar .bottom-content .toggle-switch {
        position: absolute;
        right: 0;
        height: 100%;
        min-width: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
    }
    
    .toggle-switch {
        position: absolute;
        right: 0;
        height: 100%;
        min-width: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
    }
    
    .toggle-switch .switch {
        position: relative;
        height: 22px;
        width: 40px;
        border-radius: 25px;
        background-color: var(--toggle-color);
        transition: var(--tran-05);
    }
    
    .switch::before {
        content: '';
        position: absolute;
        height: 15px;
        width: 15px;
        border-radius: 50%;
        top: 50%;
        left: 5px;
        transform: translateY(-50%);
        background-color: var(--sidebar-color);
        transition: var(--tran-04);
    }
    
    #ORCID_List.dark .switch::before,
    #LinkedIn_List.dark .switch::before,
    #GoogleScholar_List.dark .switch::before,
    #ResearchGate_List.dark .switch::before {
        left: 20px;
    }
    
    body,
    div#gs_hdr_drw {
        margin-left: 25px;
    }
    
    .TiC_btn {
        display: inline-block;
        min-width: 50px;
        font-size: 14px;
        background: var(--main-color);
        padding: 5px 10px 5px 10px !important;
        margin-left: 10px !important;
        text-align: right;
        text-decoration: none !important;
        text-transform: uppercase;
        color: #fff !important;
        cursor: pointer;
    }
    
    .btn:hover, .btn:focus, .btn:active{
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.3) !important;
        -webkit-transform: scale(1.05) !important;
        transform: scale(1.05) !important;
    }
`

function Preparation() {
    if (!GM_getValue('SUBMIT')) {
        GM_setValue('SUBMIT', {})
    }

    if (!GM_getValue('TEMP_TALENT_INFO')) {
        GM_setValue('TEMP_TALENT_INFO', {})
    }

    if (!GM_getValue('SEARCH_GENERAL')) {
        GM_setValue('SEARCH_GENERAL', '')
    }

    if (!GM_getValue('SEARCH_FIELD')) {
        GM_setValue('SEARCH_FIELD', {
            'name': '',
            'affiliate': ''
        })
    }

    if (!GM_getValue('STATE')) {
        GM_setValue('STATE', {
            'LinkedIn': 0,
            'ORCID': 0,
            'GoogleScholar': 0,
            'ResearchGate': 0
        })
    }

    if (!GM_getValue('SEARCH_PRIORITY')) {
        GM_setValue('SEARCH_PRIORITY', 'GENERAL')
    }
}

function insertAfter(NewElement, TargetElement) {
    let ParentElement = TargetElement.parentNode
    if (ParentElement.lastChild === TargetElement) {
        ParentElement.appendChild(NewElement)
    } else {
        ParentElement.insertBefore(NewElement, TargetElement.nextSibling)
    }
}

function ClearAllTimer(flag = false) {
    let timer = setInterval(() => {})
    for (let i = 1; i <= timer; ++i) {
        if (!flag && i >= timer - 1) {
            continue
        }
        clearInterval(i)
        clearTimeout(i)
    }
}

function ResetParseInform(flag) {
    ClearAllTimer(flag)
    const ParseInform = document.querySelector('div#ParseInform')
    if (ParseInform) {
        ParseInform.querySelectorAll('span').forEach((val) => {
            val.style.display = 'none'
        })
    }
}

function WaitTimeoutFunc(ParserTimer) {
    let WaitTimeout = setTimeout(async () => {
        try {
            if (RES === undefined) {
                RES = undefined
                clearTimeout(WaitTimeout)
                throw Error
            }
            else {
                clearTimeout(ParserTimer)
            }
        }
        catch {
            ResetParseInform(true)
            document.querySelector('#TimeoutParse').style.display = 'block'
            setTimeout(()=>{
                document.querySelector('#TimeoutParse').style.display = 'none'
            }, 5000)
            location.reload()
        }
    }, 20000)
}

function NegativeParse() {
    const ParseButton = document.querySelector('.TiC_sidebar #ParseButton')
    if (ParseButton) {
        ParseButton.style.cssText = 'pointer-events: none'
        ParseButton.addEventListener('click', () => {
            ResetParseInform()
            setTimeout(() => {
                document.querySelector('#CannotParse').style.display = 'block'
            }, 5000)
        })
    }
}

function ClickStopPropagation(selector) {
    selector.addEventListener('click', (e) => {
        e.stopPropagation()
    }, false)
}

const TalentSearchURL = {
    'LinkedIn': 'https://www.linkedin.com/search/results/all/?keywords=',
    'ORCID': 'https://orcid.org/orcid-search/search?searchQuery=',
    'ORCID_ADVANCE': 'https://orcid.org/orcid-search/search?',
    'GoogleScholar': 'https://scholar.google.com/citations?view_op=search_authors&mauthors=',
    'ResearchGate': 'https://www.researchgate.net/search.Search.html?type=researcher&query='
}

async function QueryFill() {
    let GeneralSearch = GM_getValue('SEARCH_GENERAL').replaceAll(' ', '%20')
    let SpecificSearch
    document.querySelector('#LinkedIn_List > a').href = TalentSearchURL.LinkedIn + GeneralSearch
    if (GM_getValue('SEARCH_FIELD').name && GM_getValue('SEARCH_FIELD').affiliate) {
        SpecificSearch = 'firstName=' + GM_getValue('SEARCH_FIELD').name + '&institution=' + GM_getValue('SEARCH_FIELD').affiliate + '&otherFields=true'
        SpecificSearch = SpecificSearch.replaceAll(' ', '%20')
        document.querySelector('#ORCID_List > a').href = TalentSearchURL.ORCID + SpecificSearch
    }
    else {
        document.querySelector('#ORCID_List > a').href = TalentSearchURL.ORCID + GeneralSearch
    }
    document.querySelector('#GoogleScholar_List > a').href = TalentSearchURL.GoogleScholar + GeneralSearch
    document.querySelector('#ResearchGate_List > a').href = TalentSearchURL.ResearchGate + GeneralSearch
}

function UpdateMemory(source, TalentInfo) {
    let TEMP_TALENT_INFO = GM_getValue('TEMP_TALENT_INFO')
    delete TEMP_TALENT_INFO[source]
    TEMP_TALENT_INFO[source] = JSON.parse(JSON.stringify(TalentInfo))
    GM_setValue('TEMP_TALENT_INFO', JSON.parse(JSON.stringify(TEMP_TALENT_INFO)))

    let SUBMIT = GM_getValue('SUBMIT')
    SUBMIT[source] = JSON.parse(JSON.stringify(TalentInfo))
    GM_setValue('SUBMIT', JSON.parse(JSON.stringify(SUBMIT)))
}

function UpdateField(Key, Field, ObjStr) {
    let TempSearchField = GM_getValue('SEARCH_FIELD')
    TempSearchField[Field] = ObjStr
    GM_setValue('SEARCH_FIELD', JSON.parse(JSON.stringify(TempSearchField)))
}

function SearchBoxListener(SearchTextBox, SearchButton) {
    function SearchValueText() {
        if (DOMAIN === 'www.linkedin.com') {
            return document.querySelector('input[class*="search"]').value
        }
        else if (DOMAIN === 'orcid.org') {
            return document.querySelector('#cy-search').value
        }
        else if (DOMAIN === 'scholar.google.com') {
            return document.querySelector('input#gs_hdr_tsi.gs_in_txt').value
        }
        else if (DOMAIN === 'www.researchgate.net') {
            return document.querySelector('input[name="query"]').value
        }
        else {
            return ''
        }
    }

    function SearchValueSave(DefaultValue = undefined) {
        let SearchValue
        DefaultValue ? SearchValue = DefaultValue : SearchValue = SearchValueText()
        if (SearchValue) {
            GM_setValue('SEARCH_GENERAL', SearchValue)
        }
    }

    if (SearchButton) {
        SearchButton.addEventListener('click', () => {
            SearchValueSave()
            GM_setValue('SEARCH_PRIORITY', 'GENERAL')
        })
    }

    if (SearchTextBox) {
        ClickStopPropagation(SearchTextBox)
        SearchTextBox.addEventListener('keydown', (e) => {
            if (e.keyCode === 13) {
                SearchValueSave()
                GM_setValue('SEARCH_PRIORITY', 'GENERAL')
            }
        })
    }

    if (DOMAIN === 'www.linkedin.com') {
        let SearchActionFlag = document.querySelector('div#global-nav-typeahead')
        SearchActionFlag.addEventListener('DOMNodeInserted', () => {
            let SearchActionResults = SearchActionFlag.querySelector('div.basic-typeahead__triggered-content')
            if (SearchActionResults) {
                SearchActionResults.querySelectorAll('div.basic-typeahead__selectable').forEach((val) => {
                    val.addEventListener('click', () => {
                        let SearchValue
                        const SelectSearch = val.querySelector('span.search-global-typeahead__hit-text[class*="t-normal"]')
                        if (SelectSearch && SelectSearch.querySelector('strong')) {
                            SearchValue = SelectSearch.innerText.trim()
                        }
                        else {
                            SearchValue = document.querySelector('input[class*="search"]').value.trim()
                        }
                        if (SearchValue) {
                            SearchValueSave(SearchValue)
                        }
                        GM_setValue('SEARCH_PRIORITY', 'GENERAL')
                    })
                })
            }
        })
    }

    if (DOMAIN === 'orcid.org') {
        const AdvancedSearchFlag = document.querySelector('div[role="search"][aria-label="ADVANCED SEARCH"]')

        if (AdvancedSearchFlag) {
            function AdvancedSearchListener() {
                const AdvanceFlag = AdvancedSearchFlag.querySelector('button[aria-label*="search form"]').ariaLabel
                if (AdvanceFlag === 'Hide advanced search form') {
                    let timer = setInterval(() => {
                        const LoadedFlag = document.querySelector('div[role="search"][aria-label="ADVANCED SEARCH"]').querySelector('form')
                        if (LoadedFlag) {
                            clearInterval(timer)
                        }
                    }, 400)
                    const AdvancedSearchResults = document.querySelector('div[role="search"][aria-label="ADVANCED SEARCH"]').querySelector('form[class*="ng-star-inserted"]')
                    const FirstName = AdvancedSearchResults.querySelector('input[formcontrolname="firstName"]')
                    const LastName = AdvancedSearchResults.querySelector('input[formcontrolname="lastName"]')
                    const Institution = AdvancedSearchResults.querySelector('input[formcontrolname="institution"]')
                    const Keyword = AdvancedSearchResults.querySelector('input[formcontrolname="keyword"]')
                    const SearchButton = AdvancedSearchResults.querySelector('button')

                    ClickStopPropagation(AdvancedSearchResults)
                    ClickStopPropagation(FirstName)
                    ClickStopPropagation(LastName)
                    ClickStopPropagation(Institution)
                    ClickStopPropagation(Keyword)

                    if (FirstName && !FirstName.value) {
                        FirstName.value = GM_getValue('SEARCH_FIELD').name
                    }

                    if (Institution && !Institution.value) {
                        Institution.value = GM_getValue('SEARCH_FIELD').affiliate
                    }

                    SearchButton.addEventListener('click', () => {
                        if (FirstName && LastName) {
                            UpdateField('SEARCH_FIELD', 'name', [FirstName.value.trim(), LastName.value.trim()].join(' ').trim())
                        }
                        if (Institution) {
                            UpdateField('SEARCH_FIELD', 'affiliate', Institution.value.trim())
                        }
                        GM_setValue('SEARCH_PRIORITY', 'GENERAL')
                    })
                }
            }

            AdvancedSearchListener()
            AdvancedSearchFlag.querySelector('button[aria-label*="search form"]').addEventListener('click', () => {
                AdvancedSearchListener()
            })
        }
    }

    if (DOMAIN === 'www.researchgate.net') {
        const SearchTextBox2 = document.querySelector('input[class="search-container__form-input"]')

        if (SearchTextBox2) {
            ClickStopPropagation(SearchTextBox2)
            SearchTextBox2.addEventListener('keydown', (e) => {
                if (e.keyCode === 13) {
                    let SearchValue = SearchTextBox2.value
                    SearchValueSave(SearchValue)
                    GM_setValue('SEARCH_PRIORITY', 'GENERAL')
                }
            })
        }

        let SearchActionFlag = document.querySelector('div.header-search-action')
        SearchActionFlag.addEventListener('DOMNodeInserted', () => {
            const SearchActionResults = SearchActionFlag.querySelector('div.header-search-action__results')
            if (SearchActionResults) {
                SearchActionResults.querySelectorAll('a[id^="downshift"]').forEach((val) => {
                    val.addEventListener('click', () => {
                        let SearchValue
                        if (val.querySelector('strong')) {
                            SearchValue = val.querySelector('strong').innerText.trim()
                        }
                        else {
                            SearchValue = val.innerText.trim().split('\n').join(' ')
                        }
                        SearchValueSave(SearchValue)
                        GM_setValue('SEARCH_PRIORITY', 'GENERAL')
                    })
                })
            }
        })
    }
}

function SaveTalent2DataBase(TalentJsonObject) {
    GM_xmlhttpRequest({
        method: "post",
        url: 'http://127.0.0.1:5000/api/insert',  // User API
        data: JSON.stringify(TalentJsonObject),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        timeout: 10000,
        onload: function (res) {
            ResetParseInform()
            document.querySelector('#SuccessSave').style.display = 'block'
            setTimeout(()=>{
                document.querySelector('#SuccessSave').style.display = 'none'
            }, 5000)
        },
        onerror: function (err) {
            ClearAllTimer()
            document.querySelector('#FailSave').style.display = 'block'
            setTimeout(()=>{
                document.querySelector('#FailSave').style.display = 'none'
            }, 5000)
            console.log(err)
            alert('通讯失败！')
        }
    });
}

async function GetParseDetails(url) {
    const response = await fetch(url)
    if (DOMAIN === 'orcid.org') {
        return await response.json()
    }
    else {
        return await response.text()
    }
}

function LinkedInSampling() {
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            const SearchTextBox = document.querySelector('input[class*="search"]')
            const TalentURLPattern = /https:\/\/www\.linkedin\.com\/in\/[^\/]+\/$/
            const TalentURLRet = TalentURLPattern.test(document.URL)

            const NameNode = document.querySelector('.text-heading-xlarge')
            const ButtonBlock = document.querySelector('.pvs-profile-actions')
            const TalentBlock = document.querySelectorAll('.artdeco-card')

            if (TalentURLRet && NameNode && ButtonBlock && TalentBlock) {
                resolve('Loaded.')
                clearInterval(timer)
            }
            else if (!TalentURLRet && SearchTextBox) {
                resolve('Loaded.')
                clearInterval(timer)
            }
        }, 400)
    })
}

function LinkedInSearchSampling(previousPage) {
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            let TalentList = document.querySelectorAll('li[class^="reusable-search"]')
            let Current = TalentList[0].querySelector('div.entity-result').attributes['data-chameleon-result-urn']
            let Previous = previousPage[0].querySelector('div.entity-result').attributes['data-chameleon-result-urn']
            if (Current !== Previous) {
                resolve('Loaded.')
                clearInterval(timer)
            }
        }, 400)
    })
}

function OrcidSampling(previousURL) {
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            const OrcidCode = document.querySelector("[class^='id orc'] [class^='orc']")
            const SearchTextBox = document.querySelector('#cy-search')
            const SearchButton = document.querySelector('#cy-search-btn')
            const NotFound = document.querySelector('section.col.notFoundResults')
            const SearchList = document.querySelectorAll('tr.ng-star-inserted')
            const TiCBtn = document.querySelectorAll('.TiC_btn')

            const HostURL = 'https://orcid.org/'
            const TalentURLPattern = /https:\/\/orcid\.org\/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/
            const TalentSearchURLPattern = /https:\/\/orcid\.org\/*/
            const TalentSearchQuery = /https:\/\/orcid\.org\/orcid-search\/search\?/

            const HostURLRet = URL === HostURL
            const TalentURLRet = TalentURLPattern.test(document.URL)
            const TalentSearchURLRet = TalentSearchURLPattern.test(document.URL)
            const TalentSearchQueryRet = TalentSearchQuery.test(document.URL)

            if (TalentSearchQueryRet && SearchTextBox && SearchButton && NotFound) {
                if ((!NotFound.hidden) || (NotFound.hidden && SearchList.length)) {
                    if (!TiCBtn.length) {
                        resolve('Loaded.')
                        clearInterval(timer)
                    }
                    else if (TalentURLPattern.test(previousURL)) {
                        resolve('Loaded.')
                        clearInterval(timer)
                    }
                }
            }
            else if (!TalentSearchQueryRet && SearchTextBox && SearchButton) {
                if (TalentURLRet && OrcidCode) {
                    resolve('Loaded.')
                    clearInterval(timer)
                }
                if (HostURLRet || TalentSearchURLRet) {
                    resolve('Loaded.')
                    clearInterval(timer)
                }
            }
        }, 400)
    })
}

function OrcidSearchSampling(PreviousPage) {
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            const TalentList = document.querySelectorAll('td.orcid-id-column')
            const Current = TalentList[0].querySelector('div.entity-result')['']
            const Previous = PreviousPage[0].querySelector('div.entity-result')['']
            if (Current !== Previous) {
                resolve('Loaded.')
                clearInterval(timer)
            }
        }, 400)
    })
}

function GoogleScholarSampling(ParserFlag=false) {
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            const MoreButton = document.querySelector('#gsc_bpf_more')
            const MoreWait = document.querySelector('#gsc_a_sp')
            const CitationButton = document.querySelector('button#gsc_hist_opn')
            const CoauthorButton = document.querySelector('button#gsc_coauth_opn')
            const SearchTextBox = document.querySelector('input#gs_hdr_tsi.gs_in_txt')
            const SearchButton = document.querySelector('button[type="submit"][name="btnG"]')

            const TalentSearchURLRet = document.URL.search('search_authors') !== -1 && document.URL.search('mauthors') !== -1
            const InstitutionMemberURLRet = document.URL.search('view_op=view_org') !== -1
            const TalentForViewRet = document.URL.search('citation_for_view') !== -1

            if (TalentForViewRet) {
                resolve('Loaded.')
                clearInterval(timer)
            }

            if (SearchTextBox && SearchButton) {
                if (TalentSearchURLRet || InstitutionMemberURLRet) {
                    resolve('Loaded.')
                    clearInterval(timer)
                }
                else if (MoreButton && MoreWait) {
                    if (!ParserFlag) {
                        resolve('Loaded.')
                        clearInterval(timer)
                    }
                    else {
                        if (MoreButton.disabled) {
                            if (!MoreWait.classList.value.length) {
                                resolve('Loaded.')
                                clearInterval(timer)
                            }
                        }
                        else {
                            MoreButton.click()
                        }
                    }
                }
            }
        }, 400)
    })
}

function ResearchGateSampling() {
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            const SearchTextBox = document.querySelector('input[name="query"]')
            const SearchButton = document.querySelector('button[class*="button"]')
            const Spinner = document.querySelector('div[class*="spinner"]')
            const SearchNoResult = document.querySelector('div.search-box__noresults')
            const SearchHasResult = document.querySelector('div.search-box-researcher')

            const TalentSearchURLPattern = /https:\/\/www\.researchgate\.net\/search\.Search\.html*/
            const PeopleSearchURLPattern = 'type=researcher'

            const TalentSearchURLRet = TalentSearchURLPattern.test(document.URL)
            const PeopleSearchRet = TalentSearchURLRet && document.URL.includes(PeopleSearchURLPattern)

            if (SearchTextBox && SearchButton) {
                if (PeopleSearchRet && !Spinner) {
                    if (SearchNoResult || SearchHasResult) {
                        resolve('Loaded.')
                        clearInterval(timer)
                    }
                }
                else if (!PeopleSearchRet) {
                    resolve('Loaded.')
                    clearInterval(timer)
                }
            }
        }, 400)
    })
}

async function Workspace() {
    let SideBar = document.createElement('nav')
    SideBar.id = 'TiC_sidebar'

    let IndexFlag = WebSites.indexOf(DOMAIN)
    let OpenClose = GM_getValue('STATE')[SitesAbbr[IndexFlag]]
    if (OpenClose === 0) {
        SideBar.className = 'TiC_sidebar'
    } else {
        SideBar.className = 'TiC_sidebar close'
    }

    SideBar.innerHTML = TiC_HTML

    document.body.appendChild(SideBar)

    let meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    document.head.appendChild(meta)

    if (DOMAIN !== 'www.linkedin.com') {
        GM_addStyle(`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap') !important`)
    }

    GM_addStyle(TiC_CSS)

    const FontIconCSS = GM_getResourceText('boxicons').replaceAll('..', 'https://cdnjs.cloudflare.com/ajax/libs/boxicons/2.1.4')
    GM_addStyle(FontIconCSS)

    if (DOMAIN === 'www.linkedin.com') {
        GM_addStyle(`.TiC_sidebar {width: 360px !important;}`)
    }

    const sidebar = document.querySelector('nav#TiC_sidebar')
    const toggle = sidebar.querySelector(".toggle")
    const modeSwitch = sidebar.querySelector(".toggle-switch")
    const modeText = sidebar.querySelector(".mode-text")
    const icon = sidebar.querySelector('body header .image')

    ClickStopPropagation(sidebar)

    document.querySelector('body').addEventListener('click', () => {
        if (!sidebar.classList.contains("close")) {
            sidebar.classList.toggle("close")
        }
    })

    toggle.addEventListener("click" , (e) =>{
        sidebar.classList.toggle("close")
        if (sidebar.classList.contains("close")) {
            OpenClose = GM_getValue('STATE')
            OpenClose[SitesAbbr[IndexFlag]] = 1
            GM_setValue('STATE', JSON.parse(JSON.stringify(OpenClose)))
        }
        else {
            OpenClose = GM_getValue('STATE')
            OpenClose[SitesAbbr[IndexFlag]] = 0
            GM_setValue('STATE', JSON.parse(JSON.stringify(OpenClose)))
        }
    })

    const SaveButton = document.querySelector('#SaveButton')
    SaveButton.addEventListener('click', () => {
        const TalentInfo = GM_getValue('SUBMIT')
        if (Object.keys(TalentInfo).length) {
            SaveTalent2DataBase(TalentInfo)
        }
        else {
            document.querySelector('#FailSave').style.display = 'block'
            setTimeout(()=>{
                document.querySelector('#FailSave').style.display = 'none'
            }, 5000)
        }
    })

    const ClearButton = document.querySelector('#ClearButton')
    ClearButton.addEventListener('click', () => {
        GM_setValue('TEMP_TALENT_INFO', {})
        GM_setValue('SUBMIT', {})
        GM_setValue('SEARCH_GENERAL', '')
        GM_setValue('SEARCH_FIELD', {'name': '', 'affiliate': ''})
        GM_setValue('SEARCH_PRIORITY', 'GENERAL')
    })

    const ViewButton = document.querySelector('#ViewButton')
    ViewButton.addEventListener('click', () => {
        let NewTab = window.open('', '_blank', '')
        const TalentInfoStringify = JSON.stringify(GM_getValue('SUBMIT'), null, 4)
        NewTab.document.write('<pre></pre>')
        let JsonRegion = NewTab.document.querySelector('pre')
        JsonRegion.innerText = TalentInfoStringify
    })

    let TempTalentInfo = GM_getValue('TEMP_TALENT_INFO')
    let SubmitTalentInfo = GM_getValue('SUBMIT')

    if (Object.keys(TempTalentInfo).length) {
        await RenderTalentInfo()
    }

    GM_addValueChangeListener('TEMP_TALENT_INFO', async (name, old_value, new_value, remote) =>{
        await RenderTalentInfo()
    })

    function ToggleTalentSelection(source) {
        const ListQuery = source + '_List'
        const ButtonQuery = 'Parsed' + source
        const ToggleList = document.getElementById(ListQuery)
        const ToggleButton = document.getElementById(ButtonQuery)
        
        if (SubmitTalentInfo[source]) {
            if (!ToggleList.classList.contains('dark')) {
                ToggleList.classList.toggle('dark')
            }
        }
        
        ToggleButton.addEventListener('click', () => {
            if (GM_getValue('TEMP_TALENT_INFO')[source]) {
                ToggleList.classList.toggle('dark')
                if (ToggleList.classList.contains('dark')) {
                    let TalentTemp = GM_getValue('SUBMIT')
                    TalentTemp[source] = JSON.parse(JSON.stringify(GM_getValue('TEMP_TALENT_INFO')[source]))
                    GM_setValue('SUBMIT', JSON.parse(JSON.stringify(TalentTemp)))
                }
                else {
                    let TalentTemp = GM_getValue('SUBMIT')
                    delete TalentTemp[source]
                    GM_setValue('SUBMIT', JSON.parse(JSON.stringify(TalentTemp)))
                }
            }
        })

        GM_addValueChangeListener('SUBMIT', async (name, old_value, new_value, remote) =>{
            SitesAbbr.forEach((source) => {
                const ListQueryListener = source + '_List'
                const ToggleListListener = document.getElementById(ListQueryListener)
                if (old_value[source] && !new_value[source]) {
                    if (ToggleListListener.classList.contains('dark')) {
                        ToggleListListener.classList.toggle('dark')
                    }
                }
                if (!old_value[source] && new_value[source]) {
                    if (!ToggleListListener.classList.contains('dark')) {
                        ToggleListListener.classList.toggle('dark')
                    }
                }
            })
        })
    }

    SitesAbbr.forEach((source) => {
        ToggleTalentSelection(source)
    })

    GM_addValueChangeListener('SEARCH_FIELD', async (name, old_value, new_value, remote) =>{
        QueryFill()
        GM_setValue('SEARCH_GENERAL', [new_value.name, new_value.affiliate].join(' ').trim())
    })
}

async function RenderTalentInfo() {
    let TalentInfoBlock = document.querySelector('.TiC_sidebar #TalentInfoText')
    TalentInfoBlock.innerHTML = ''
    TalentInfoBlock.style.display = 'block'

    const Talent = GM_getValue('TEMP_TALENT_INFO')

    Object.entries(Talent).reverse().forEach((Ta) => {
        if (Ta[0] === 'LinkedIn') {
            let TalentWrap = document.createElement('div')
            TalentWrap.className = 'WrapTalentText'
            TalentWrap.innerHTML = LinkedIn_TextInfoBox

            const TalentNameDIV = TalentWrap.querySelector('#TalentNameDIV')
            const TalentLocationDIV = TalentWrap.querySelector('#TalentLocationDIV')
            const TalentExperimentDIV = TalentWrap.querySelector('#TalentExperimentDIV')
            const TalentEducationDIV = TalentWrap.querySelector('#TalentEducationDIV')

            const TalentName = document.createElement('p')
            TalentName.innerText = Ta[1].profile.name
            while (TalentNameDIV.querySelector('.TextTitle').nextElementSibling) {
                TalentNameDIV.querySelector('.TextTitle').nextElementSibling.remove()
            }
            TalentNameDIV.appendChild(TalentName)
            TalentNameDIV.style.display = 'block'

            if (Ta[1].profile.location) {
                const TalentLocation = document.createElement('p')
                TalentLocation.innerText = Ta[1].profile.location
                while (TalentLocationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentLocationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                TalentLocationDIV.appendChild(TalentLocation)
                TalentLocationDIV.style.display = 'block'
            }

            if (Ta[1].experience && Ta[1].experience.length) {
                while (TalentExperimentDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentExperimentDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].experience.forEach((val) => {
                    const TalentExperience = document.createElement('p')
                    TalentExperience.innerText = val.name
                    if (val.position) {
                        TalentExperience.innerText += ' · ' + val.position
                    }
                    TalentExperimentDIV.appendChild(TalentExperience)
                })
                TalentExperimentDIV.style.display = 'block'
            }

            if (Ta[1].education && Ta[1].education.length) {
                while (TalentEducationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentEducationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].education.forEach((val) => {
                    const TalentEducation = document.createElement('p')
                    TalentEducation.innerText = val.name
                    if (val.qualification) {
                        TalentEducation.innerText += ' · ' + val.qualification
                    }
                    if (val.major) {
                        TalentEducation.innerText += ' · ' + val.major
                    }
                    TalentEducationDIV.appendChild(TalentEducation)
                })
                TalentEducationDIV.style.display = 'block'
            }
            TalentInfoBlock.appendChild(TalentWrap)
        }

        if (Ta[0] === 'ORCID') {
            let TalentWrap = document.createElement('div')
            TalentWrap.className = 'WrapTalentText'
            TalentWrap.innerHTML = ORCID_TextInfoBox

            const TalentNameDIV = TalentWrap.querySelector('#TalentNameDIV')
            const TalentLocationDIV = TalentWrap.querySelector('#TalentLocationDIV')
            const TalentExperimentDIV = TalentWrap.querySelector('#TalentExperimentDIV')
            const TalentEducationDIV = TalentWrap.querySelector('#TalentEducationDIV')

            const TalentName = document.createElement('p')
            TalentName.innerText = Ta[1].profile.name
            while (TalentNameDIV.querySelector('.TextTitle').nextElementSibling) {
                TalentNameDIV.querySelector('.TextTitle').nextElementSibling.remove()
            }
            TalentNameDIV.appendChild(TalentName)
            TalentNameDIV.style.display = 'block'

            if (Ta[1].profile.country && Ta[1].profile.country.length) {
                while (TalentLocationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentLocationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].profile.country.forEach((val) => {
                    const TalentLocation = document.createElement('p')
                    TalentLocation.innerText = val
                    TalentLocationDIV.appendChild(TalentLocation)
                })
                TalentLocationDIV.style.display = 'block'
            }

            if (Ta[1].experience && Ta[1].experience.length) {
                while (TalentExperimentDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentExperimentDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].experience.forEach((val) => {
                    const TalentExperience = document.createElement('p')
                    TalentExperience.innerText = val.name
                    if (val.departmentName) {
                        TalentExperience.innerText += ' · ' + val.departmentName
                    }
                    if (val.roleTitle) {
                        TalentExperience.innerText += ' · ' + val.roleTitle
                    }
                    TalentExperimentDIV.appendChild(TalentExperience)
                })
                TalentExperimentDIV.style.display = 'block'
            }

            if (Ta[1].education && Ta[1].education.length) {
                while (TalentEducationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentEducationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].education.forEach((val) => {
                    const TalentEducation = document.createElement('p')
                    TalentEducation.innerText = val.name
                    if (val.departmentName) {
                        TalentEducation.innerText += ' · ' + val.departmentName
                    }
                    if (val.roleTitle) {
                        TalentEducation.innerText += ' · ' + val.roleTitle
                    }
                    TalentEducationDIV.appendChild(TalentEducation)
                })
                TalentEducationDIV.style.display = 'block'
            }
            TalentInfoBlock.appendChild(TalentWrap)
        }

        if (Ta[0] === 'GoogleScholar') {
            let TalentWrap = document.createElement('div')
            TalentWrap.className = 'WrapTalentText'
            TalentWrap.innerHTML = GoogleScholar_TextInfoBox

            const TalentNameDIV = TalentWrap.querySelector('#TalentNameDIV')
            const TalentAffiliationDIV = TalentWrap.querySelector('#TalentAffiliationDIV')
            const TalentSpecializationDIV = TalentWrap.querySelector('#TalentSpecializationDIV')

            const TalentName = document.createElement('p')
            TalentName.innerText = Ta[1].profile.name
            while (TalentNameDIV.querySelector('.TextTitle').nextElementSibling) {
                TalentNameDIV.querySelector('.TextTitle').nextElementSibling.remove()
            }
            TalentNameDIV.appendChild(TalentName)
            TalentNameDIV.style.display = 'block'

            if (Ta[1].affiliation && Object.keys(Ta[1].affiliation).length) {
                const TalentAffiliation = document.createElement('p')
                TalentAffiliation.innerText = Ta[1].affiliation.name
                while (TalentAffiliationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentAffiliationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                TalentAffiliationDIV.appendChild(TalentAffiliation)
                TalentAffiliationDIV.style.display = 'block'
            }

            if (Ta[1].interest && Ta[1].interest.length) {
                while (TalentSpecializationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentSpecializationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].interest.forEach((val) => {
                    const TalentSpecialization = document.createElement('p')
                    TalentSpecialization.innerText = val
                    TalentSpecializationDIV.appendChild(TalentSpecialization)
                })
                TalentSpecializationDIV.style.display = 'block'
            }
            TalentInfoBlock.appendChild(TalentWrap)
        }

        if (Ta[0] === 'ResearchGate') {
            let TalentWrap = document.createElement('div')
            TalentWrap.className = 'WrapTalentText'
            TalentWrap.innerHTML = ResearchGate_TextInfoBox

            const TalentNameDIV = TalentWrap.querySelector('#TalentNameDIV')
            const TalentLocationDIV = TalentWrap.querySelector('#TalentLocationDIV')
            const TalentExperienceDIV = TalentWrap.querySelector('#TalentExperienceDIV')
            const TalentEducationDIV = TalentWrap.querySelector('#TalentEducationDIV')

            const TalentName = document.createElement('p')
            TalentName.innerText = Ta[1].profile.name
            while (TalentNameDIV.querySelector('.TextTitle').nextElementSibling) {
                TalentNameDIV.querySelector('.TextTitle').nextElementSibling.remove()
            }
            TalentNameDIV.appendChild(TalentName)
            TalentNameDIV.style.display = 'block'

            if (Ta[1].profile.location) {
                const TalentLocation = document.createElement('p')
                TalentLocation.innerText = Ta[1].profile.location
                while (TalentLocationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentLocationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                TalentLocationDIV.appendChild(TalentLocation)
                TalentLocationDIV.style.display = 'block'
            }

            if (Ta[1].experience && Ta[1].experience.length) {
                while (TalentExperienceDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentExperienceDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].experience.forEach((val) => {
                    const TalentExperience = document.createElement('p')
                    TalentExperience.innerText = val.name
                    if (val.department) {
                        TalentExperience.innerText += ' · ' + val.department
                    }
                    if (val.position) {
                        TalentExperience.innerText += ' · ' + val.position
                    }
                    TalentExperienceDIV.appendChild(TalentExperience)
                })
                TalentExperienceDIV.style.display = 'block'
            }

            if (Ta[1].education && Ta[1].education.length) {
                while (TalentEducationDIV.querySelector('.TextTitle').nextElementSibling) {
                    TalentEducationDIV.querySelector('.TextTitle').nextElementSibling.remove()
                }
                Ta[1].education.forEach((val) => {
                    const TalentEducation = document.createElement('p')
                    TalentEducation.innerText = val.name
                    if (val.degree) {
                        TalentEducation.innerText += ' · ' + val.degree
                    }
                    if (val.field_of_study) {
                        TalentEducation.innerText += ' · ' + val.field_of_study
                    }
                    TalentEducationDIV.appendChild(TalentEducation)
                })
                TalentEducationDIV.style.display = 'block'
            }
            TalentInfoBlock.appendChild(TalentWrap)
        }

    })
}


async function LinkedInLoading(previousPage) {
    const SearchPage = ['feed', 'search', 'jobs', 'school', 'company', 'groups']
    const TalentSearchURLPattern = document.URL.match(/https:\/\/www\.linkedin\.com\/([^\/]+)\//)[1]
    const TalentURLPattern = /https:\/\/www\.linkedin\.com\/in\/[^\/]+\/$/
    const TalentURLPatternSupplement = /https:\/\/www\.linkedin\.com\/in\/[^\/]+\/[^\/]+\/*/
    const PeopleGeneralSearchURLPattern = /https:\/\/www\.linkedin\.com\/search\/results\/all\/\?keywords=*/
    const PeopleSearchURLPattern = /https:\/\/www\.linkedin\.com\/search\/results\/people\/*/

    const TalentURLRet = TalentURLPattern.test(document.URL)
    const TalentURLSupplementRet = TalentURLPatternSupplement.test(document.URL)
    const PeopleSearchRet = PeopleSearchURLPattern.test(document.URL)
    const PeopleGeneralSearchRet = PeopleGeneralSearchURLPattern.test(document.URL)

    function PreloadIframe(CurrentURL, ProfileFlag) {
        const body = document.body
        IframeDestroy()

        function IframeItem(name, url) {
            let Details = document.createElement('iframe')
            Details.className = name
            Details.src = CurrentURL + url
            Details.style.display = 'none'
            body.appendChild(Details)

            return Details
        }

        let ContactInfo = IframeItem('ContactInfo', 'overlay/contact-info/')
        let EducationDetails = IframeItem('EducationDetails', 'details/education/')
        let ExperienceDetails = IframeItem('ExperienceDetails', 'details/experience/')
        let SkillDetails = IframeItem('SkillDetails', 'details/skills/')

        if (ProfileFlag) {
            let ProfileInfo = IframeItem('ProfileInfo', '')
            return [ProfileInfo, ContactInfo, ExperienceDetails, EducationDetails, SkillDetails]
        }
        else {
            return [ContactInfo, ExperienceDetails, EducationDetails, SkillDetails]
        }
    }

    function IframeDestroy() {
        let OldProfile = document.querySelector('iframe.ProfileInfo')
        if (OldProfile) {
            OldProfile.remove()
        }

        let OldContact = document.querySelector('iframe.ContactInfo')
        if (OldContact) {
            OldContact.remove()
        }

        let OldExperienceDetails = document.querySelector('iframe.ExperienceDetails')
        if (OldExperienceDetails) {
            OldExperienceDetails.remove()
        }

        let OldEducationDetails = document.querySelector('iframe.EducationDetails')
        if (OldEducationDetails) {
            OldEducationDetails.remove()
        }

        let OldSkillDetails = document.querySelector('iframe.SkillDetails')
        if (OldSkillDetails) {
            OldSkillDetails.remove()
        }
    }

    function IframeLoading(iframes, ProfileFlag) {
        let flag = new Array(iframes.length).fill(1)
        return new Promise((resolve, reject) => {
            let timer = setInterval(()=>{
                iframes.forEach((frame, index) => {
                    frame.onload = async () => {
                        flag[index] = 0
                    }
                })
                if (eval(flag.join('+')) === 0) {
                    const ContactInfo = document.querySelector('iframe.ContactInfo').contentDocument
                    const ContactCard = ContactInfo.querySelector('div.pv-profile-section__section-info')

                    const ExperienceIframe = document.querySelector('iframe.ExperienceDetails').contentDocument
                    const ExperienceElementsList = ExperienceIframe.querySelectorAll("li[id*='EXPERIENCE-VIEW-DETAILS-profile-']")

                    const EducationIframe = document.querySelector('iframe.EducationDetails').contentDocument
                    const EducationElementsList = EducationIframe.querySelectorAll("li[id*='EDUCATION-VIEW-DETAILS-profile-']")

                    const SkillIframe = document.querySelector('iframe.SkillDetails').contentDocument
                    const skills = SkillIframe.querySelectorAll('li[id*="SKILLS-VIEW-DETAILS-profileTabSection-ALL-SKILLS"]')
                    const NonSkill = SkillIframe.querySelector('section.artdeco-card section h2')
                    let NonSkillText
                    NonSkill ? NonSkillText = NonSkill.innerText.trim() : NonSkillText = null

                    if (ContactCard && (skills.length !== 0 || (skills.length === 0 && NonSkillText === 'Nothing to see for now')) &&
                        ExperienceElementsList.length !== 0 && EducationElementsList.length !== 0) {
                        if (ProfileFlag) {
                            const ProfileIframe = document.querySelector('iframe.ProfileInfo').contentDocument
                            const Profile = ProfileIframe.querySelector('h1.text-heading-xlarge')
                            if (Profile) {
                                resolve('Loaded.')
                                clearInterval(timer)
                            }
                        }
                        else {
                            resolve('Loaded.')
                            clearInterval(timer)
                        }
                    }
                }
            }, 400)
        })
    }

    async function ParseProfile(ProfileFlag) {
        let Profile = {}
        let ProfileBox
        let doc

        if (ProfileFlag) {
            ProfileBox = document.querySelector('iframe.ProfileInfo').contentDocument
            doc = ProfileBox
        }
        else {
            ProfileBox = document.querySelector(".artdeco-card.ember-view.pv-top-card")
            doc = document
        }

        const avatar = ProfileBox.querySelector('img.pv-top-card-profile-picture__image')
        if (avatar) {
            Profile.avatar = avatar.src
        }
        Profile.name = ProfileBox.querySelector('h1.text-heading-xlarge').innerText.trim()
        const NamePattern = /(?<=\()\S+(?=\)$)/g
        const AdditionName = Profile.name.match(NamePattern)
        if (AdditionName && AdditionName.length === 1) {
            Profile.addition_name = AdditionName[0].trim()
        }

        const bio = ProfileBox.querySelector('div[class^="text-body-medium"][class*="break-words"]').innerText.trim()
        if (bio !== '--') {
            Profile.bio = bio
        }

        const headlines = ProfileBox.querySelector('div[class^="text-body-small"][class*="break-words"]')
        if (headlines) {
            Profile.headline = headlines.querySelector('span').innerText.trim()
        }

        const ProvidingServices = document.querySelector('div.pv-open-to-carousel')
        if (ProvidingServices && ProvidingServices.querySelector('p.truncate.text-body-small')) {
            Profile.service = ProvidingServices.querySelector('p.truncate.text-body-small').innerText.trim()
        }

        Profile.location = ProfileBox.querySelector('div.pv-text-details__left-panel.mt2 span.text-body-small').innerText.trim()

        const ProfileSection = doc.querySelectorAll('section.artdeco-card')
        ProfileSection.forEach((val) => {
            const Title = val.querySelector('div.pvs-header__container')
            if (Title && Title.innerText.trim().includes('About')) {
                if (Title.nextElementSibling) {
                    Profile.about = Title.nextElementSibling.querySelector('span').innerText.trim()
                }
            }
        })

        return JSON.parse(JSON.stringify(Profile))
    }

    async function ParseContact() {
        let contact = {}
        const ContactInfo = document.querySelector('iframe.ContactInfo').contentDocument

        const ContactCard = ContactInfo.querySelector('div.pv-profile-section__section-info')

        let ProfileUrl = ContactCard.querySelector("section[class*='vanity-url']")
        if (ProfileUrl) {
            contact.profile = ProfileUrl.querySelector("a[class*='contact-link']").href
        }

        let Websites = ContactCard.querySelector("section[class*='websites']")
        if (Websites) {
            let WebsitesList = []
            let WebsitesPair = {}
            Websites.querySelectorAll('ul li').forEach((entry) => {
                WebsitesPair.type = entry.querySelector('span').innerText.trim().slice(1, -1).trim()
                WebsitesPair.url = entry.querySelector("[class*='contact-link']").innerText.trim()
                WebsitesList.push(JSON.parse(JSON.stringify(WebsitesPair)))
            })
            contact.websites = JSON.parse(JSON.stringify(WebsitesList))
        }

        let Phone = ContactCard.querySelector("section[class*='phone']")
        if (Phone) {
            let PhoneList = []
            let PhonePair = {}
            Phone.querySelectorAll('ul li').forEach((entry) => {
                const entries = entry.querySelectorAll('span')
                PhonePair.type = entries[1].innerText.trim().slice(1, -1).trim()
                PhonePair.number = entries[0].innerText.trim()
                PhoneList.push(JSON.parse(JSON.stringify(PhonePair)))
            })
            contact.phone = JSON.parse(JSON.stringify(PhoneList))
        }

        let Address = ContactCard.querySelector("section[class*='address']")
        if (Address) {
            contact.address = Address.querySelector('div').innerText.trim()
        }

        let InstantMessaging = ContactCard.querySelector("section[class*='ims']")
        if (InstantMessaging) {
            let IMsList = []
            let IMsPair = {}
            InstantMessaging.querySelectorAll('ul li').forEach((entry) => {
                const entries = entry.querySelectorAll('span')
                IMsPair.service = entries[1].innerText.trim().slice(1, -1).trim()
                IMsPair.username = entries[0].innerText.trim()
                IMsList.push(JSON.parse(JSON.stringify(IMsPair)))
            })
            contact.IMs = JSON.parse(JSON.stringify(IMsList))
        }

        let Birthday = ContactCard.querySelector("section[class*='birthday']")
        if (Birthday) {
            contact.birthday = Birthday.querySelector('div').innerText.trim()
        }

        const OtherContactInfo = ContactCard.querySelectorAll("section[class*='contact-type']")
        const ExistContactType = ['vanity', 'websites', 'phone', 'address', 'ims', 'birthday']
        OtherContactInfo.forEach((entry) => {
            let flag = true
            ExistContactType.forEach((term) => {
                if (entry.className.includes(term)) {
                    flag = false
                    return false
                }
            })
            if (flag) {
                const ContactType = entry.querySelector("h3[class*='contact-info__header']").innerText.trim()
                const url = entry.querySelector('ul li a').href
                if (url) {
                    contact[ContactType] = url
                }
            }
        })

        return JSON.parse(JSON.stringify(contact))
    }

    async function ParseEducation() {
        let education = []
        const EducationIframe = document.querySelector('iframe.EducationDetails').contentDocument
        const EducationElementsList = EducationIframe.querySelectorAll("li[id*='EDUCATION-VIEW-DETAILS-profile-']")

        if (EducationElementsList.length === 1 && EducationElementsList[0].innerText.trim().includes('Nothing to see for now')) {
            return education
        }

        for (let i = 0; i < EducationElementsList.length; ++i) {
            let EducationElements = {}
            let item = EducationElementsList[i]

            const EducationAvatar = item.querySelector("img[class*='EntityPhoto']")
            if (EducationAvatar) {
                EducationElements.avatar = EducationAvatar.src
            }

            EducationElements.name = item.querySelectorAll('span.mr1 > span')[0].innerText.trim()

            // some problems
            const degree = item.querySelectorAll('div.justify-space-between > a > span')[0]
            if (degree) {
                const DegreeClass = degree.className
                if (!DegreeClass.includes('black--light')) {
                    const DegreeList = degree.querySelector('span').innerText.trim().split(',')
                    if (DegreeList.length === 1) {
                        EducationElements.qualification = DegreeList[0].trim()
                    } else if (DegreeList.length > 1) {
                        if (DegreeList.indexOf('- MBBS') !== -1) {
                            EducationElements.qualification = DegreeList.slice(0, 2).join().trim()
                            if (DegreeList.length > 2) {
                                EducationElements.major = DegreeList.slice(2,).join().trim()
                            }
                        } else {
                            EducationElements.qualification = DegreeList[0].trim()
                            EducationElements.major = DegreeList.slice(1,).join().trim()
                        }
                    }
                }
            }

            const time = item.querySelector("span[class*='black--light'] > span")
            if (time) {
                EducationElements.time = time.innerText.trim()
            }

            education.push(EducationElements)
        }

        return JSON.parse(JSON.stringify(education))
    }

    async function ParseExperience() {
        let experience = []
        const ExperienceIframe = document.querySelector('iframe.ExperienceDetails').contentDocument
        const ExperienceElementsList = ExperienceIframe.querySelectorAll("li[id*='EXPERIENCE-VIEW-DETAILS-profile-']")

        if (ExperienceElementsList.length === 1 && ExperienceElementsList[0].innerText.trim().includes('Nothing to see for now')) {
            return experience
        }

        for (let i = 0; i < ExperienceElementsList.length; ++i) {
            let ExperienceElement = {}
            let item = ExperienceElementsList[i]
            const ExperienceAvatar = item.querySelector("img[class*='EntityPhoto']")
            if (ExperienceAvatar) {
                ExperienceElement.avatar = ExperienceAvatar.src
            }
            if (item.querySelectorAll("[id*='profilePositionGroup']").length === 0) {
                ExperienceElement.name = item.querySelector('.justify-space-between > div > span > span').innerText.split('·')[0].trim()
                const TimeOrLocation = item.querySelectorAll("span[class*='t-black--light']")
                if (TimeOrLocation.length) {
                    ExperienceElement.time = TimeOrLocation[0].querySelector('span').innerText.trim()
                }
                if (TimeOrLocation.length === 2) {
                    const area0 = TimeOrLocation[1]
                    ExperienceElement.location = area0.querySelector('span').innerText.trim()
                }
                ExperienceElement.position = item.querySelector('.mr1 > span').innerText.trim()
                const description = item.querySelector('.pvs-list__outer-container span')
                if (description) {
                    ExperienceElement.description = description.innerText.trim()
                }
                experience.push(ExperienceElement)
            }
            else {
                const PositionGroup = item.querySelectorAll("[id*='profilePositionGroup']")
                ExperienceElement.name = item.querySelectorAll('.mr1')[0].querySelector('span').innerText.split('·')[0].trim()
                const Location = item.querySelector('.justify-space-between').querySelectorAll("span[class*='t-black--light']")
                if (Location.length > 0) {
                    const area0 = Location[0]
                    ExperienceElement.location = area0.querySelector('span').innerText.trim().split('\n')[0].trim()
                }
                for (let i = 0; i < PositionGroup.length; i++) {
                    ExperienceElement.time = PositionGroup[i].querySelector("span[class*='t-black--light'] > span").innerText.trim()
                    ExperienceElement.position = PositionGroup[i].querySelector('.mr1 > span').innerText.trim()
                    const description = PositionGroup[i].querySelector('.pvs-list__outer-container span')
                    if (description && description.innerText) {
                        ExperienceElement.description = description.innerText.trim()
                    }
                    experience.push(JSON.parse(JSON.stringify(ExperienceElement)))
                }
            }
        }
        
        return JSON.parse(JSON.stringify(experience))
    }

    async function ParseSkill() {
        let skill = []
        const SkillIframe = document.querySelector('iframe.SkillDetails').contentDocument
        const skills = SkillIframe.querySelectorAll('li[id*="SKILLS-VIEW-DETAILS-profileTabSection-ALL-SKILLS"]')
        skills.forEach((val) => {
            skill.push(val.querySelector('.mr1 span').innerText.trim())
        })
        
        return JSON.parse(JSON.stringify(skill))
    }

    async function Parser(CurrentURL, ProfileFlag) {
        ResetParseInform()
        document.querySelector('#IsParsing').style.display = 'block'

        await LinkedInSampling()

        let Iframes = PreloadIframe(CurrentURL, ProfileFlag)
        await IframeLoading(Iframes, ProfileFlag)

        let Talent = {}
        Talent.source = 'LinkedIn'
        let doc
        if (ProfileFlag) {
            doc = document.querySelector('iframe.ProfileInfo').contentDocument
        }
        else {
            doc = document
        }
        Talent.ID = doc.querySelector('section[data-member-id]').attributes['data-member-id'].value

        Talent.url = CurrentURL

        Talent.profile = await ParseProfile(ProfileFlag)

        Talent.contact = await ParseContact()

        Talent.experience = await ParseExperience()

        Talent.education = await ParseEducation()

        Talent.skill = await ParseSkill()

        let TalentName = Talent.profile.name
        let TalentAffiliateName
        Talent.experience.length ? TalentAffiliateName = Talent.experience[0].name : TalentAffiliateName = ''

        UpdateField('SEARCH_FIELD', 'name', TalentName)
        UpdateField('SEARCH_FIELD', 'affiliate', TalentAffiliateName)
        GM_setValue('SEARCH_GENERAL', [TalentName, TalentAffiliateName].join(' ').trim())

        UpdateMemory('LinkedIn', Talent)

        document.querySelector('#IsParsing').style.display = 'none'
        document.querySelector('#SuccessParse').style.display = 'block'
        let SuccessTimer = setTimeout(()=>{
            document.querySelector('#SuccessParse').style.display = 'none'
        }, 5000)

        RES = true
        GM_setValue('SEARCH_PRIORITY', 'FIELD')
    }

    if (TalentURLRet || PeopleSearchRet || TalentURLSupplementRet || SearchPage.includes(TalentSearchURLPattern)) {
        await LinkedInSampling()
        await Workspace()
        await QueryFill()

        const SearchTextBox = document.querySelector('input[class*="search"]')

        if (SearchTextBox && !document.querySelector('input[class*="search"]').value) {
            if (GM_getValue('SEARCH_PRIORITY') === 'GENERAL') {
                document.querySelector('input[class*="search"]').value = GM_getValue('SEARCH_GENERAL')
            }
            else {
                document.querySelector('input[class*="search"]').value = GM_getValue('SEARCH_FIELD').name + ' ' + GM_getValue('SEARCH_FIELD').affiliate
            }
        }

        SearchBoxListener(SearchTextBox, null)
    }

    function RenderBTN(val) {
        let OldBtn = val.querySelector('a.TiC_btn')
        if (OldBtn) {
            OldBtn.remove()
        }
        let loc = val.querySelector('.entity-result__title-text a')

        let btn = document.createElement('a')
        const MatchedTalent = loc.href.match(/(https:\/\/www\.linkedin\.com\/in\/[^?]+)\/*/)
        if (MatchedTalent) {
            btn.innerText = '暂存解析'
            btn.className = 'TiC_btn'
            btn.role = MatchedTalent[1]
        }
        else {
            btn.innerText = '不可访问'
            btn.className = 'TiC_btn'
            btn.style.pointerEvents = 'none'
        }
        insertAfter(btn, loc)

        btn.addEventListener('click', async () => {
            if (btn.role) {
                const JumpURL = btn.role + '/'

                let ParserTimer = setTimeout(async () => {
                    try {
                        await Parser(JumpURL, true)
                    }
                    catch {
                        ResetParseInform(true)
                        document.querySelector('#FailureParse').style.display = 'block'
                        setTimeout(()=>{
                            document.querySelector('#FailureParse').style.display = 'none'
                        }, 5000)
                        location.reload()
                    }
                }, 0);

                WaitTimeoutFunc(ParserTimer)
            }
        })

        ClickStopPropagation(btn)
    }

    if (PeopleGeneralSearchRet) {
        const SearchBlock = document.querySelector('div.search-results-container')
        if (SearchBlock) {
            SearchBlock.querySelectorAll('div[class*="artdeco-card"]').forEach((block) => {
                const Title = block.querySelector('h2.search-results__cluster-title')
                if (Title && Title.innerText.trim() === 'People') {
                    const SearchList = block.querySelector('ul.reusable-search__entity-result-list')
                    if (SearchList) {
                        SearchList.querySelectorAll('li.reusable-search__result-container').forEach((val) => {
                            RenderBTN(val)
                        })
                    }
                }
            })
        }
    }

    if (PeopleSearchRet) {
        let PageInfo = document.querySelectorAll('li[class^="reusable-search"]')
        if (PageInfo.length && previousPage) {
            if (previousPage[0].querySelector('div.entity-result').attributes['data-chameleon-result-urn'] === PageInfo[0].querySelector('div.entity-result').attributes['data-chameleon-result-urn']) {
                await LinkedInSearchSampling(previousPage)
            }
        }

        let SearchList = document.querySelectorAll('ul[class*="reusable-search"] li')
        SearchList.forEach((val) => {
            RenderBTN(val)
        })
    }

    if (TalentURLRet) {
        const ParseButton = document.querySelector('.TiC_sidebar #ParseButton')
        ParseButton.addEventListener('click', async () => {
            let ParserTimer = setTimeout(async () => {
                try {
                    await Parser(document.URL, false)
                }
                catch {
                    ResetParseInform(true)
                    document.querySelector('#FailureParse').style.display = 'block'
                    setTimeout(()=>{
                        document.querySelector('#FailureParse').style.display = 'none'
                    }, 5000)
                    location.reload()
                }
            }, 0);

            WaitTimeoutFunc(ParserTimer)
        })
    }
    else {
        NegativeParse()
    }
}


async function ORCIDLoading(previousURL, previousPage) {
    const HostURL = 'https://orcid.org/'
    const TalentURLPattern = /https:\/\/orcid\.org\/\w{4}-\w{4}-\w{4}-\w{4}$/
    const TalentSearchURLPattern = /https:\/\/orcid\.org\/orcid-search\/search\/*/

    const HostURLRet = URL === HostURL
    const TalentURLRet = TalentURLPattern.test(document.URL)
    const TalentSearchURLRet = TalentSearchURLPattern.test(document.URL)

    function sparseDate(date) {
        if (!date || !date.year) {
            return null
        }
        else {
            if (!date.month) {
                return date.year
            } else {
                if (!date.day) {
                    return date.year + '-' + date.month
                } else {
                    return date.year + '-' + date.month + '-' + date.day
                }
            }
        }
    }

    function ParsePublicRecord(item) {
        let profile = {}

        profile.name = item.displayName

        const Biography = item.biography
        if (Biography) {
            profile.bio = Biography.biography.value
        }

        const otherNames = item.otherNames.otherNames
        if (otherNames.length) {
            profile.otherName = []
            otherNames.forEach((val) => {
                profile.otherName.push(val.content)
            })
        }

        const Region = item.countries.addresses
        if (Region.length) {
            profile.country = []
            Region.forEach((regions) => {
                profile.country.push(regions.countryName)
            })
        }

        const Email = item.emails.emails
        if (Email) {
            profile.email = []
            Email.forEach((emails) => {
                profile.email.push(emails.value)
            })
        }

        const Website = item.website.websites
        if (Website.length) {
            profile.website = []
            Website.forEach((websites) => {
                let WebsitePair = {}
                WebsitePair.name = websites.urlName
                WebsitePair.url = websites.url.value
                profile.website.push(JSON.parse(JSON.stringify(WebsitePair)))
            })
        }

        const ExternalIdentifier = item.externalIdentifier.externalIdentifiers
        if (ExternalIdentifier.length) {
            profile.otherID = []
            ExternalIdentifier.forEach((identifier) => {
                let Identifiers = {}

                const commonName = identifier.commonName
                if (commonName) {
                    Identifiers.commonName = commonName
                }

                const reference = identifier.reference
                if (reference) {
                    Identifiers.reference = reference
                }

                const url = identifier.url
                if (url) {
                    Identifiers.url = url
                }

                profile.otherID.push(JSON.parse((JSON.stringify(Identifiers))))
            })
        }

        const Keyword = item.keyword.keywords
        if (Keyword.length) {
            profile.keyword = []
            Keyword.forEach((keywords) => {
                profile.keyword.push(keywords.content)
            })
        }

        return profile
    }

    function ParseAffiliationGroups(item, query) {
        let AffiliationList = []
        const Affiliations = item.affiliationGroups[query]

        if (Affiliations.length) {
            Affiliations.forEach(affiliates => {
                let affiliation = {}
                const affiliate = affiliates.affiliations[0]
                affiliation.name = affiliate.affiliationName.value
                affiliation.city = affiliate.city.value

                const region = affiliate.region.value
                if (region) {
                    affiliation.region = region
                }

                affiliation.country = affiliate.country.value

                const roleTitle = affiliate.roleTitle.value
                if (roleTitle) {
                    affiliation.roleTitle = roleTitle
                }

                const departmentName = affiliate.departmentName.value
                if (departmentName) {
                    affiliation.departmentName = departmentName
                }

                const affiliationType = affiliate.affiliationType.value
                if (affiliationType) {
                    affiliation.affiliationType = affiliationType
                }

                const startDate = sparseDate(affiliate.startDate)
                if (startDate) {
                    affiliation.startDate = startDate
                }
                const endDate = sparseDate(affiliate.endDate)
                if (endDate) {
                    affiliation.endDate = endDate
                }

                const sourceName = affiliate.sourceName
                if (sourceName) {
                    affiliation.sourceName = sourceName
                }

                const source = affiliate.source
                if (source) {
                    affiliation.source = source
                }

                const url = affiliate.url.value
                if (url) {
                    affiliation.url = url
                }

                AffiliationList.push(JSON.parse(JSON.stringify(affiliation)))
            })
        }

        return JSON.parse(JSON.stringify(AffiliationList))
    }

    async function ParseWorksExtendedPage(item) {
        let papers = []
        item.groups.forEach((group) => {
            let paper = {}

            let externalIdentifiers = []
            group.externalIdentifiers.forEach((identifier) => {
                let identifiers = {}
                identifiers.externalIdentifierId = identifier.externalIdentifierId.value
                identifiers.externalIdentifierType = identifier.externalIdentifierType.value
                const url = identifier.url
                if (url) {
                    identifiers.url = url.value
                }
                externalIdentifiers.push(JSON.parse(JSON.stringify(identifiers)))
            })
            if (externalIdentifiers.length) {
                paper.externalIdentifiers = JSON.parse(JSON.stringify(externalIdentifiers))
            }

            let workers = []
            group.works.forEach((work) => {
                let works = {}

                const publicationDate = sparseDate(work.publicationDate)
                if (publicationDate) {
                    works.publicationDate = publicationDate
                }

                const putCode = work.putCode.value
                if (putCode) {
                    works.putCode = putCode
                }

                const shortDescription = work.shortDescription
                if (shortDescription) {
                    works.shortDescription = shortDescription
                }

                const url = work.url
                if (url) {
                    works.url = url
                }

                const journalTitle = work.journalTitle.value
                if (journalTitle) {
                    works.journalTitle = journalTitle
                }

                let contributors = []
                work.contributorsGroupedByOrcid.forEach((contributor) => {
                    contributors.push(contributor.creditName.content)
                })
                if (contributors.length) {
                    works.contributors = contributors
                }

                const source = work.source
                if (source) {
                    works.source = source
                }

                const sourceName = work.sourceName
                if (sourceName) {
                    works.sourceName = sourceName
                }

                works.title = work.title.value

                const subtitle = work.subtitle
                if (subtitle) {
                    works.title = subtitle
                }

                const translatedTitle = work.translatedTitle
                if (translatedTitle) {
                    works.translatedTitle = translatedTitle
                }

                const workCategory = work.workCategory
                if (workCategory) {
                    works.translatedTitle = workCategory
                }

                works.workType = work.workType.value

                workers.push(JSON.parse(JSON.stringify(works)))
            })

            if (workers.length) {
                paper.works = (JSON.parse(JSON.stringify(workers)))
            }
            papers.push(JSON.parse(JSON.stringify(paper)))
        })

        // let BibTexURL = []
        // papers.forEach((val0, index0) => {
        //     val0.works.forEach((val1, index1) => {
        //         if (val1.putCode) {
        //             BibTexURL.push([val1.putCode, index0, index1])
        //         }
        //     })
        // })

        // async function func() {
        //     const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
        //     const BibTexURLPromises = BibTexURL.map(x => GetParseDetails(document.URL + '/getWorkInfo.json?workId=' + x[0]))
        //     for (const [index, promise] of BibTexURLPromises.entries()) {
        //         const BibTexJSON = await promise
        //         let citation = BibTexJSON.citation
        //         if (citation) {
        //             citation = citation.citation.value
        //             let index0 = BibTexURL[index][1]
        //             let index1 = BibTexURL[index][2]
        //             papers[index0].works[index1].citation = citation
        //             delete papers[index0].works[index1].putCode
        //         }
        //     }
        // }
        // await func()

        return JSON.parse(JSON.stringify(papers))
    }

    async function Parser(orcid, CurrentURL) {
        ResetParseInform()
        document.querySelector('#IsParsing').style.display = 'block'

        let Talent = {}
        Talent.source = 'ORCID'
        Talent.orcid = orcid
        Talent.ID = Talent.orcid
        Talent.url = CurrentURL
        Talent.pdf_url = CurrentURL + '/print'

        const RangeText = await GetParseDetails(CurrentURL + '/worksExtendedPage.json?offset=0&sort=date&sortAsc=false&pageSize=1')
        const Range = RangeText.totalGroups
        const SupplementURL = ['/public-record.json', '/affiliationGroups.json', '/worksExtendedPage.json?offset=0&sort=date&sortAsc=false&pageSize=' + Range]

        const promises = SupplementURL.map(x => GetParseDetails(CurrentURL + x))
        for (const [index, promise] of promises.entries()) {
            const DetailsJSON = await promise
            if (index === 0) {
                Talent.profile = ParsePublicRecord(DetailsJSON)
            } else if (index === 1) {
                Talent.experience = ParseAffiliationGroups(DetailsJSON, 'EMPLOYMENT')
                Talent.education = ParseAffiliationGroups(DetailsJSON, 'EDUCATION')
                Talent.qualification = ParseAffiliationGroups(DetailsJSON, 'QUALIFICATION')
            } else if (index === 2) {
                Talent.works = await ParseWorksExtendedPage(DetailsJSON)
            }
        }

        let TalentName = Talent.profile.name
        let TalentAffiliateName
        Talent.experience.length ? TalentAffiliateName = Talent.experience[0].name : TalentAffiliateName = ''

        UpdateField('SEARCH_FIELD', 'name', TalentName)
        UpdateField('SEARCH_FIELD', 'affiliate', TalentAffiliateName)
        GM_setValue('SEARCH_GENERAL', [TalentName, TalentAffiliateName].join(' ').trim())

        UpdateMemory('ORCID', Talent)

        document.querySelector('#IsParsing').style.display = 'none'
        document.querySelector('#SuccessParse').style.display = 'block'
        setTimeout(()=>{
            document.querySelector('#SuccessParse').style.display = 'none'
        }, 5000)

        RES = true
        GM_setValue('SEARCH_PRIORITY', 'FIELD')
    }

    if (HostURLRet || TalentURLRet || TalentSearchURLRet) {
        await Workspace()
        await QueryFill()
        await OrcidSampling(previousURL)
        const SearchTextBox = document.querySelector('#cy-search')
        const SearchButton = document.querySelector('#cy-search-btn')

        if (!SearchTextBox.value) {
            if (GM_getValue('SEARCH_PRIORITY') === 'GENERAL') {
                document.querySelector('#cy-search').value = GM_getValue('SEARCH_GENERAL')
            }
            else {
                document.querySelector('#cy-search').value = GM_getValue('SEARCH_FIELD').name + ' ' + GM_getValue('SEARCH_FIELD').affiliate
            }
        }

        SearchBoxListener(SearchTextBox, SearchButton)
    }

    if (TalentSearchURLRet) {
        let PageInfo = document.querySelectorAll('td.orcid-id-column')
        if (PageInfo.length && previousPage) {
            if (previousPage[0].innerText === PageInfo[0].innerText) {
                await OrcidSearchSampling(previousPage)
            }
            previousPage = PageInfo
        }

        let SearchList = document.querySelectorAll('tr.ng-star-inserted')
        SearchList.forEach((val) => {
            let OldBtn = val.querySelector('a.Tic_btn')
            if (OldBtn) {
                OldBtn.remove()
            }

            let loc = val.querySelector('td')
            let btn = document.createElement('a')
            btn.innerText = '暂存解析'
            btn.className = 'TiC_btn'
            btn.role = loc.querySelector('a').innerText.trim()
            loc.appendChild(btn)

            btn.addEventListener('click', async () => {
                const orcid = btn.role
                const JumpURL = 'https://orcid.org/' + orcid

                let ParserTimer = setTimeout(async () => {
                    try {
                        await Parser(orcid, JumpURL)
                    }
                    catch {
                        ResetParseInform(true)
                        document.querySelector('#FailureParse').style.display = 'block'
                        setTimeout(()=>{
                            document.querySelector('#FailureParse').style.display = 'none'
                        }, 5000)
                        location.reload()
                    }
                }, 0);

                WaitTimeoutFunc(ParserTimer)
            })

            ClickStopPropagation(btn)
        })
    }

    if (TalentURLRet) {
        const ParseButton = document.querySelector('.TiC_sidebar #ParseButton')
        ParseButton.addEventListener('click', async () => {
            const orcid = document.querySelector("[class^='id orc'] [class^='orc']").innerText.trim()

            let ParserTimer = setTimeout(async () => {
                try {
                    await Parser(orcid, document.URL)
                }
                catch {
                    ResetParseInform(true)
                    document.querySelector('#FailureParse').style.display = 'block'
                    setTimeout(()=>{
                        document.querySelector('#FailureParse').style.display = 'none'
                    }, 5000)
                    location.reload()
                }
            }, 0);

            WaitTimeoutFunc(ParserTimer)
        })
    }
    else {
        NegativeParse()
    }
}


async function GoogleScholarLoading() {
    const TalentURLPattern = /https:\/\/scholar\.google\.com\/citations\?*/
    const TalentRet = TalentURLPattern.test(document.URL)
    const TalentSearchURLRet = document.URL.search('search_authors') !== -1
    const TalentURLRet = document.URL.search('user=') !== -1
    const InstitutionURLRet = document.URL.search('view_op=view_org') !== -1
    const TalentForViewRet = document.URL.search('citation_for_view') !== -1

    async function ParseProfile(doc) {
        let Profile = {}
        const ProfileBox = doc.querySelector("#gsc_prf")
        Profile.avatar = ProfileBox.querySelector('#gsc_prf_pua img').src
        Profile.name = ProfileBox.querySelector('#gsc_prf_in').innerText.trim()
        Profile.url = doc.URL

        const OtherName = ProfileBox.querySelector('#gsc_prf_ion')
        if (OtherName) {
            Profile.other_name = []
            OtherName.querySelectorAll('#gs_prf_ion_txt').forEach((val) => {
                Profile.other_name.push(val.innerText.trim())
            })
        }

        const HomePage = doc.querySelector('#gsc_prf_ivh')
        if (HomePage) {
            const HomePageURL = HomePage.querySelector('a')
            if (HomePageURL) {
                Profile.home_page = HomePageURL.href
            }
        }

        return JSON.parse(JSON.stringify(Profile))
    }

    async function ParseInterest(doc) {
        let areas_of_interest = []
        const Interests = doc.querySelectorAll('#gsc_prf_int a')
        Interests.forEach((val) => {
            const Interest = val.innerText.trim()
            areas_of_interest.push(Interest)
        })

        return JSON.parse(JSON.stringify(areas_of_interest))
    }

    async function ParseAffiliate(doc) {
        const Affiliates = doc.querySelectorAll('.gsc_prf_il')
        let Affiliation = {}
        Affiliates.forEach((val) => {
            if (!val.id.length) {
                if (val.innerText.trim() !== 'Unknown affiliation') {
                    Affiliation.name = val.innerText.trim()
                }
                let url = val.querySelector('a')
                if (url) {
                    Affiliation.url = url.href
                }
            }
        })

        let Verified = doc.querySelector('#gsc_prf_ivh')
        if (Verified) {
            Affiliation.verified = Verified.innerText.trim()
        }

        return JSON.parse(JSON.stringify(Affiliation))
    }

    async function ParseCitation_Coauthor(doc, ID) {
        let Citation_Coauthor = {}
        let CitationStatistics = {}
        let CitationAll = {}
        const TotalCitationsBox = doc.querySelector('#gsc_rsb_cit #gsc_rsb_st')
        const TotalCitationsTable = TotalCitationsBox.querySelector('table#gsc_rsb_st tbody')
        TotalCitationsTable.querySelectorAll('tr').forEach((val) => {
            const index = val.querySelectorAll('td')[0].innerText.trim()
            const value = val.querySelectorAll('td')[1].innerText.trim()
            if (index === 'Citations') {
                CitationAll.citations = value
            } else if (index === 'h-index') {
                CitationAll.h_index = value
            } else if (index === 'i10-index') {
                CitationAll.i10_index = value
            }
        })
        CitationStatistics.citations_all = JSON.parse(JSON.stringify(CitationAll))

        const YearCitationsUrl = 'https://scholar.google.com/' + 'citations?user=' + ID + '&hl=en&oi=sra'
        const CoauthorsUrl = 'https://scholar.google.com/' + 'citations?view_op=list_colleagues&hl=en&json=&user=' + ID
        const [YearCitationsDoc, CoauthorsDoc] = await Promise.all([GetParseDetails(YearCitationsUrl), GetParseDetails(CoauthorsUrl)])

        let CitationsTemplate = document.createElement('template')
        CitationsTemplate.innerHTML = YearCitationsDoc
        const YearCitationsHist = CitationsTemplate.content.querySelector('div.gsc_md_hist_b')

        if (YearCitationsHist) {
            const Year = YearCitationsHist.querySelectorAll('.gsc_g_t')
            const YearCitations = YearCitationsHist.querySelectorAll('.gsc_g_a')
            const YearRange = Year.length
            CitationStatistics.citations_per_year = []

            let i = 0
            for (let YearNum = YearRange, index = 0; YearNum > 0; --YearNum, ++index) {
                let YearCitation = {}
                YearCitation.year = Year[index].innerHTML.trim()
                let zIndex = parseInt(YearCitations[i].style.zIndex)

                if (zIndex !== YearNum) {
                    YearCitation.citations = '0'
                }
                else {
                    YearCitation.citations = YearCitations[i].innerText.trim()
                    ++i
                }

                CitationStatistics.citations_per_year.push(JSON.parse(JSON.stringify(YearCitation)))
            }
        }

        let CoauthorsTemplate = document.createElement('template')
        CoauthorsTemplate.innerHTML = CoauthorsDoc

        let Coauthor = []
        CoauthorsTemplate.content.querySelectorAll('.gsc_ucoar').forEach((val) => {
            let CoauthorDict = {}
            CoauthorDict.ID = val.id.match(/[^-]+$/g)[0]
            CoauthorDict.name = val.querySelector('.gs_ai_name').innerText.trim()
            CoauthorDict.avatar = val.querySelector('.gs_ai_pho img').src
            CoauthorDict.affiliation = val.querySelector('.gs_ai_aff').innerText.trim()
            Coauthor.push(JSON.parse(JSON.stringify(CoauthorDict)))
        })

        Citation_Coauthor.CitationStatistics = CitationStatistics
        Citation_Coauthor.Coauthor = Coauthor

        return JSON.parse(JSON.stringify(Citation_Coauthor))
    }

    async function ParsePaper(doc) {
        const PapersTable = doc.querySelector('#gsc_a_t #gsc_a_b').querySelectorAll('.gsc_a_tr')
        let Paper = []

        PapersTable.forEach((val) => {
            let Papers = {}
            Papers.title = val.querySelector('td.gsc_a_t a').innerText.trim()
            const citations = val.querySelector('.gsc_a_c').innerText.trim()
            if (citations) {
                Papers.citations = val.querySelector('.gsc_a_c').innerText.trim()
            } else {
                Papers.citations = '0'
            }
            Papers.authors = val.querySelector('td.gsc_a_t').querySelectorAll('div')[0].innerText.trim().split(', ')
            const journal = val.querySelector('td.gsc_a_t').querySelectorAll('div')[1].innerText.trim()
            if (journal) {
                Papers.journal = journal
            }
            Papers.url = val.querySelector('td.gsc_a_t a').href

            Paper.push(JSON.parse(JSON.stringify(Papers)))
        })

        // const promises = PaperUrl.map(x => GetParseDetails(x))
        // for (const [index, promise] of promises.entries()) {
        //     const DetailHTML = await promise
        //     const DetailTable = DetailHTML.querySelector('#gsc_oci_table')
        //
        //     let strList = []
        //     DetailTable.querySelectorAll('.gs_scl').forEach((val) => {
        //         let field = '"' + val.querySelector('.gsc_oci_field').innerText.trim() + '"'
        //         if (field === '"Total citations"' || field === '"Scholar articles"') {
        //             return true
        //         }
        //         let value = val.querySelector('.gsc_oci_value').innerText.trim()
        //
        //         if (field === '"Authors"') {
        //             let values = val.querySelector('.gsc_oci_value').innerText.trim()
        //             values = JSON.stringify(values.split(', '))
        //             strList.push(field + ':' + values)
        //             return true
        //         }
        //         value = '"' + value + '"'
        //         strList.push(field + ':' + value)
        //     })
        //     Paper[index] = Object.assign({}, Paper[index], JSON.parse('{' + strList.join(',') + '}'))
        // }

        return JSON.parse(JSON.stringify(Paper))
    }

    async function Parser(CurrentURL, Flag) {
        ResetParseInform()
        document.querySelector('#IsParsing').style.display = 'block'

        const ParserFlag = true
        await GoogleScholarSampling(ParserFlag)

        let Talent = {}
        Talent.source = 'GoogleScholar'

        let doc
        if (Flag) {
            const TalentPage = await GetParseDetails(CurrentURL)
            let TalentTemplate = document.createElement('template')
            TalentTemplate.innerHTML = TalentPage
            doc = TalentTemplate.content
        }
        else {
            doc = document
        }

        const ID = doc.querySelector("input[name='user']").value
        Talent.ID = ID

        Talent.url = CurrentURL

        Talent.profile = await ParseProfile(doc)

        Talent.interest = await ParseInterest(doc)

        Talent.affiliation = await ParseAffiliate(doc)

        const Citation_Coauthor = await ParseCitation_Coauthor(doc, ID)

        Talent.citation = Citation_Coauthor.CitationStatistics
        Talent.coauthor = Citation_Coauthor.Coauthor

        Talent.paper = await ParsePaper(doc)

        let TalentName = Talent.profile.name
        let TalentAffiliateName
        Talent.affiliation.name ? TalentAffiliateName = Talent.affiliation.name : TalentAffiliateName = ''

        UpdateField('SEARCH_FIELD', 'name', TalentName)
        UpdateField('SEARCH_FIELD', 'affiliate', TalentAffiliateName)
        GM_setValue('SEARCH_GENERAL', [TalentName, TalentAffiliateName].join(' ').trim())

        UpdateMemory('GoogleScholar', Talent)

        document.querySelector('#IsParsing').style.display = 'none'
        document.querySelector('#SuccessParse').style.display = 'block'
        setTimeout(()=>{
            document.querySelector('#SuccessParse').style.display = 'none'
        }, 5000)

        RES = true
        GM_setValue('SEARCH_PRIORITY', 'FIELD')
    }

    if (TalentRet && (TalentSearchURLRet || TalentURLRet || InstitutionURLRet)) {
        await Workspace()
        await QueryFill()
        await GoogleScholarSampling()

        const SearchTextBox = document.querySelector('input#gs_hdr_tsi.gs_in_txt')
        const SearchButton = document.querySelector('button[type="submit"][name="btnG"]')
        const SearchClick = document.querySelector('#gs_hdr_sre')

        // if (SearchClick){
        //     SearchClick.click()
        // }

        if (SearchTextBox && !document.querySelector('input#gs_hdr_tsi.gs_in_txt').value) {
            if (GM_getValue('SEARCH_PRIORITY') === 'GENERAL') {
                document.querySelector('input#gs_hdr_tsi.gs_in_txt').value = GM_getValue('SEARCH_GENERAL')
            }
            else {
                document.querySelector('input#gs_hdr_tsi.gs_in_txt').value = GM_getValue('SEARCH_FIELD').name + ' ' + GM_getValue('SEARCH_FIELD').affiliate
            }
        }

        SearchBoxListener(SearchTextBox, SearchButton)
    }

    if (TalentRet && (TalentSearchURLRet || InstitutionURLRet)) {
        document.querySelector('[role="main"]').style.paddingLeft = '160px'

        let SearchList = document.querySelectorAll('div[role="main"] .gsc_1usr')
        SearchList.forEach((val) => {
            let loc = val.querySelector('h3.gs_ai_name')
            let btn = document.createElement('a')
            btn.innerText = '暂存解析'
            btn.className = 'TiC_btn'
            btn.role = loc.querySelector('a').href

            loc.appendChild(btn)

            btn.addEventListener('click', async () => {
                const JumpURL = btn.role

                let ParserTimer = setTimeout(async () => {
                    try {
                        await Parser(JumpURL, true)
                    }
                    catch {
                        ResetParseInform(true)
                        document.querySelector('#FailureParse').style.display = 'block'
                        setTimeout(()=>{
                            document.querySelector('#FailureParse').style.display = 'none'
                        }, 5000)
                        location.reload()
                    }
                }, 0);

                WaitTimeoutFunc(ParserTimer)
            })

            ClickStopPropagation(btn)
        })
    }


    if (TalentURLRet && !TalentForViewRet) {
        const ParseButton = document.querySelector('.TiC_sidebar #ParseButton')
        ParseButton.addEventListener('click', async () => {
            let ParserTimer = setTimeout(async () => {
                try {
                    await Parser(document.URL, false)
                }
                catch {
                    ResetParseInform(true)
                    document.querySelector('#FailureParse').style.display = 'block'
                    setTimeout(()=>{
                        document.querySelector('#FailureParse').style.display = 'none'
                    }, 5000)
                    location.reload()
                }
            }, 0);

            WaitTimeoutFunc(ParserTimer)
        })
    }
    else {
        NegativeParse()
    }
}


async function ResearchGateLoading() {
    const HostURL = 'https://www.researchgate.net/'
    const TalentSearchURLPattern = /https:\/\/www\.researchgate\.net\/search\.Search\.html*/
    const TalentURLPattern = /https:\/\/www\.researchgate\.net\/profile\/[^\/]+/
    const ProfileURLPattern = /https:\/\/www\.researchgate\.net\/profile\/[^\/]+$/
    const InstitutionURLPattern = /https:\/\/www\.researchgate\.net\/institution\/*/
    const MemberSearchPattern = /https:\/\/www\.researchgate\.net\/institution\/[^\/]+\/members\/*/
    const SelfURLPattern = document.querySelector('div.profile-header__details-container span.nova-legacy-c-button__label')
    let SelfURLRet
    SelfURLPattern && SelfURLPattern.innerText === 'Edit' ? SelfURLRet = true : SelfURLRet = false

    const PeopleSearchURLPattern = 'type=researcher'

    const HostURLRet = URL === HostURL
    const TalentURLRet = TalentURLPattern.test(document.URL)
    const ProfileURLRet = ProfileURLPattern.test(document.URL)
    const TalentSearchURLRet = TalentSearchURLPattern.test(document.URL)
    const PeopleSearchRet = TalentSearchURLRet && URL.includes(PeopleSearchURLPattern)
    const MemberSearchRet = MemberSearchPattern.test(document.URL)
    const InstitutionURLRet = InstitutionURLPattern.test(document.URL)

    function ParseLink(url) {
        url = url.replace('https://www.researchgate.net/deref/', '')
        url = url.replace('?forcePage=true', '')
        return url.replaceAll("%3A", ":")
            .replaceAll("%2F", "/")
            .replaceAll("%3F", "?")
            .replaceAll("%3D", "=")
            .replaceAll("%26", "&")
    }

    async function ParseProfile(doc) {
        let Profile = {}
        const ProfileBox = doc.querySelector('div.profile-header__details-container')
        const ProfileList = ProfileBox.querySelector('div.nova-legacy-o-stack.nova-legacy-o-stack--gutter-xxs')
        Profile.name = ProfileList.querySelector('div.nova-legacy-e-text.nova-legacy-e-text--size-xl').innerText.trim()
        ProfileList.querySelectorAll('li.nova-legacy-e-list__item').forEach((val, index) => {
            if (index === 0 && val.innerText !== 'Degree') {
                Profile.degree = val.innerText.trim()
            } else if (index === 1 && val.innerText !== 'Position') {
                Profile.position = val.innerText.trim()
            } else if (index === 2 && val.innerText !== 'Institution') {
                Profile.institution = val.innerText.trim()
            }
        })

        Profile.avatar = ProfileBox.querySelector('div.nova-legacy-e-avatar img').src
        const Loc_Webs = ProfileList.querySelector('div.nova-legacy-o-stack.nova-legacy-o-stack--gutter-s')
        if (Loc_Webs) {
            const Loc_Web = Loc_Webs.querySelectorAll('.nova-legacy-e-text.nova-legacy-e-text--size-m')
            if (Loc_Web[0].innerText.trim() !== 'Location') {
                Profile.location = Loc_Web[0].innerText.trim()
            }
            if (Loc_Web.length === 3) {
                let website = ProfileList.querySelector('a.nova-legacy-e-link')
                if (website) {
                    let href = website.href
                    Profile.website = ParseLink(href)
                }
            }
        }

        let CurrentActivity = ProfileBox.querySelector('div.nova-legacy-o-stack.nova-legacy-o-stack--gutter-xl em')
        if (CurrentActivity) {
            Profile.current_activity = CurrentActivity.innerText.trim()
        }

        Profile.about = await ParseAbout(doc)
        Profile.membership = await ParseMembership(doc)

        return JSON.parse(JSON.stringify(Profile))
    }

    async function ParseCitationsStatics(doc) {
        let CitationsStatics = {}
        const CitationBox = doc.querySelector('div.profile-header__stats')
        const CitationList = CitationBox.querySelectorAll('div.nova-legacy-l-flex__item.nova-legacy-l-flex')

        CitationList.forEach((val) => {
            const IndexName = val.querySelector('[class*="nova-legacy-c-metric__text"]').innerText.trim().toLowerCase().split(' ').join('_')
            const IndexValue = val.querySelector('[class*="nova-legacy-e-text--color-inherit"]').innerText.trim()
            if (IndexValue === '- -') {
                return false
            }

            CitationsStatics[IndexName] = IndexValue
        })

        return JSON.parse(JSON.stringify(CitationsStatics))
    }

    async function ParseTopCoauthor(doc) {
        let Coauthor = []

        let CoauthorBox = doc.querySelector('div.profile-top-coauthors div.authors-container')
        if (CoauthorBox) {
            CoauthorBox.querySelectorAll('div.nova-legacy-v-person-list-item').forEach((val) => {
                let Author = {}
                let avatar = val.querySelector('a.nova-legacy-e-link--theme-decorated img')
                if (avatar) {
                    Author.avatar = val.querySelector('a.nova-legacy-e-link--theme-decorated img').src
                }
                Author.name = val.querySelector('a.nova-legacy-e-link--theme-bare').innerText.trim()
                let Institution = val.querySelector('ul.nova-legacy-v-person-list-item__meta')
                if (Institution) {
                    Author.institution = val.querySelector('ul.nova-legacy-v-person-list-item__meta').innerText.trim()
                }

                Coauthor.push(JSON.parse(JSON.stringify(Author)))
            })
        }

        return JSON.parse(JSON.stringify(Coauthor))
    }

    async function ParseAbout(doc) {
        let About = {}
        const OverviewBox = doc.querySelector('div.profile-overview__box-top')
        const OverviewCard = OverviewBox.querySelector('div.nova-legacy-o-stack').childNodes

        OverviewCard.forEach((val) => {
            let Header = val.querySelector('div.nova-legacy-c-card__header')
            if (Header) {
                let Title = val.querySelector('div.nova-legacy-c-card__header').querySelector('div.nova-legacy-e-text').innerText.trim()

                if (Title.includes('About')) {
                    let Item = val.querySelector('div.nova-legacy-c-card__body').querySelectorAll('div.nova-legacy-o-stack__item')
                    Item.forEach((ItemKV) => {
                        let ItemKey = ItemKV.querySelector(':nth-child(1)').innerText.trim().toLowerCase().split(' ').join('_')
                        let TagName = ItemKV.querySelector(':nth-child(2)').tagName

                        if (TagName === 'DIV') {
                            About[ItemKey] = ItemKV.querySelector(':nth-child(2)').innerText.trim()
                        }
                        else if (TagName === 'UL') {
                            let ItemVal = []
                            ItemKV.querySelector(':nth-child(2)').querySelectorAll('li').forEach((Desc) => {
                                let text = Desc.innerText.trim()
                                if (text === 'Twitter') {
                                    const link = Desc.querySelector('a.nova-legacy-e-link')
                                    if (link && link.href) {
                                        text = ParseLink(link.href)
                                    }
                                }

                                ItemVal.push(text)
                            })

                            About[ItemKey] = JSON.parse(JSON.stringify(ItemVal))
                        }
                    })
                }
            }
        })

        return JSON.parse(JSON.stringify(About))
    }

    async function ParseAffiliations(doc) {
        let Affiliations = {}
        let Experience = []
        let Education = []
        const OverviewBox = doc.querySelector('div.profile-overview__box-bottom')
        const OverviewCard = OverviewBox.querySelector('div.nova-legacy-o-stack').childNodes

        function ParseAffiliateItem(val) {
            let Affiliates = []
            let Items = val.querySelectorAll('div.nova-legacy-v-institution-item__body')
            Items.forEach((Item) => {
                let Affiliate = {}

                let avatar = Item.querySelector('a.nova-legacy-e-avatar img')
                if (avatar) {
                    Affiliate.avatar = avatar.src
                }

                let ItemKVs = Item.querySelectorAll('div.nova-legacy-v-institution-item__stack-item')
                Affiliate.name = ItemKVs[0].innerText.trim()

                let time = ItemKVs[1].innerText.trim()

                if(time) {
                    Affiliate.time = time
                }
                ItemKVs.forEach((ItemKV, index) => {
                    if (index < 2) {
                        return false
                    }
                    let ItemTerm = ItemKV.innerText.trim()
                    if (ItemTerm) {
                        const ItemKey = ItemKV.querySelector('[class*="info-section-title"]').innerText.trim().toLowerCase().split(' ').join('_')
                        Affiliate[ItemKey] = ItemKV.querySelector('[class*="info-section-list"]').innerText.trim()
                    }
                })

                Affiliates.push(JSON.parse(JSON.stringify(Affiliate)))
            })

            return JSON.parse(JSON.stringify(Affiliates))
        }

        OverviewCard.forEach((val) => {
            let Header = val.querySelector('div.nova-legacy-c-card__header')

            if (Header) {
                let Title = val.querySelector('div.nova-legacy-c-card__header').querySelector('div.nova-legacy-e-text').innerText.trim()

                if (Title.includes('Affiliations')) {
                    Experience = ParseAffiliateItem(val)
                }

                if (Title.includes('Education')) {
                    Education = ParseAffiliateItem(val)
                }
            }
        })

        Affiliations.experience = JSON.parse(JSON.stringify(Experience))
        Affiliations.education = JSON.parse(JSON.stringify(Education))

        return JSON.parse(JSON.stringify(Affiliations))
    }

    async function ParseProject(doc) {
        let Projects = []
        const OverviewBox = doc.querySelector('div.profile-overview__box-bottom')
        const OverviewCard = OverviewBox.querySelector('div.nova-legacy-o-stack').childNodes

        OverviewCard.forEach((val) => {
            let Header = val.querySelector('div.nova-legacy-c-card__header')
            if (Header) {
                let Title = val.querySelector('div.nova-legacy-c-card__header').querySelector('div.nova-legacy-e-text').innerText.trim()
                if (Title.includes('Projects')) {
                    let Items = val.querySelectorAll('div.nova-legacy-v-project-item')
                    Items.forEach((Item) => {
                        let Project = {}
                        Project.name = Item.querySelector('div.nova-legacy-e-text').innerText.trim()
                        let Url = Item.querySelector('div.nova-legacy-e-text a')
                        if (Url && Url.href) {
                            Project.url = Url.href
                        }
                        Projects.push(JSON.parse(JSON.stringify(Project)))
                    })
                }
            }
        })

        return JSON.parse(JSON.stringify(Projects))
    }

    async function ParseMembership(doc) {
        let Membership = {}
        const OverviewBox = doc.querySelector('div.profile-overview__box-bottom')
        const OverviewCard = OverviewBox.querySelector('div.nova-legacy-o-stack').childNodes
        OverviewCard.forEach((val) => {
            let Header = val.querySelector('div.nova-legacy-c-card__header')
            if (Header) {
                let Title = val.querySelector('div.nova-legacy-c-card__header').querySelector('div.nova-legacy-e-text').innerText.trim()
                if (Title.includes('Memberships and ORCID iD')) {
                    let Items = val.querySelectorAll('div.nova-legacy-o-grid__column')
                    Items.forEach((ItemKV) => {
                        let ItemTerm = ItemKV.innerText.trim()
                        if (ItemTerm) {
                            let ItemKey = ItemKV.querySelector('div.nova-legacy-o-stack__item:nth-child(1)').innerText.trim().toLowerCase().split(' ').join('_')
                            Membership[ItemKey] = ItemKV.querySelector('div.nova-legacy-o-stack__item:nth-child(2)').innerText.trim()
                        }
                    })
                }
            }
        })

        return JSON.parse(JSON.stringify(Membership))
    }

    async function Parser(CurrentURL, Flag) {
        ResetParseInform()
        document.querySelector('#IsParsing').style.display = 'block'

        await ResearchGateSampling()

        let Talent = {}
        Talent.source = 'ResearchGate'

        let doc

        if (Flag) {
            const TalentPage = await GetParseDetails(CurrentURL)
            let TalentTemplate = document.createElement('template')
            TalentTemplate.innerHTML = TalentPage
            doc = TalentTemplate.content
        }
        else {
            doc = document
        }

        Talent.ID = CurrentURL.match(/[^\/]+$/)[0]

        Talent.url = CurrentURL

        Talent.profile = await ParseProfile(doc)

        const Affiliation_Education = await ParseAffiliations(doc)

        Talent.experience = Affiliation_Education.experience

        Talent.education = Affiliation_Education.education

        Talent.citation = await ParseCitationsStatics(doc)

        Talent.coauthor = await ParseTopCoauthor(doc)

        Talent.project = await ParseProject(doc)

        let TalentName = Talent.profile.name
        let TalentAffiliateName
        Talent.experience.length ? TalentAffiliateName = Talent.experience[0].name : TalentAffiliateName = ''

        UpdateField('SEARCH_FIELD', 'name', TalentName)
        UpdateField('SEARCH_FIELD', 'affiliate', TalentAffiliateName)
        GM_setValue('SEARCH_GENERAL', [TalentName, TalentAffiliateName].join(' ').trim())

        UpdateMemory('ResearchGate', Talent)

        document.querySelector('#IsParsing').style.display = 'none'
        document.querySelector('#SuccessParse').style.display = 'block'
        setTimeout(()=>{
            document.querySelector('#SuccessParse').style.display = 'none'
        }, 5000)

        RES = true
        GM_setValue('SEARCH_PRIORITY', 'FIELD')
    }

    const SearchTextBox = document.querySelector('input[name="query"]')
    const SearchButton = document.querySelector('button[class*="button"]')
    const SearchTextBox2 = document.querySelector('input[class="search-container__form-input"]')

    SearchBoxListener(SearchTextBox, SearchButton)

    if (!SelfURLRet && (HostURLRet || TalentSearchURLRet || TalentURLRet || InstitutionURLRet)) {
        await Workspace()
        await QueryFill()
        await ResearchGateSampling()
        if (SearchTextBox && !document.querySelector('input[name="query"]').value) {
            if (GM_getValue('SEARCH_PRIORITY') === 'GENERAL') {
                document.querySelector('input[name="query"]').value = GM_getValue('SEARCH_GENERAL')
            }
            else {
                document.querySelector('input[name="query"]').value = GM_getValue('SEARCH_FIELD').name + ' ' + GM_getValue('SEARCH_FIELD').affiliate
            }
        }
        if (SearchTextBox2 && !document.querySelector('input[class="search-container__form-input"]').value) {
            if (GM_getValue('SEARCH_PRIORITY') === 'GENERAL') {
                document.querySelector('input[class="search-container__form-input"]').value = GM_getValue('SEARCH_GENERAL')
            }
            else {
                document.querySelector('input[class="search-container__form-input"]').value = GM_getValue('SEARCH_FIELD').name + ' ' + GM_getValue('SEARCH_FIELD').affiliate
            }
        }
    }

    function RenderBTN(Item) {
        let loc = Item.querySelector('.nova-legacy-e-text.nova-legacy-e-text--size-l')
        let btn = document.createElement('a')
        btn.innerText = '暂存解析'
        btn.className = 'TiC_btn'

        let href = loc.querySelector('a').href
        if (href.includes('?_iepl')) {
            btn.role = href.slice(0, href.indexOf('?_iepl'))
        }
        else {
            btn.role = href
        }
        loc.appendChild(btn)

        btn.addEventListener('click', async () => {
            const JumpURL = btn.role

            let ParserTimer = setTimeout(async () => {
                try {
                    await Parser(JumpURL, true)
                }
                catch {
                    ResetParseInform(true)
                    document.querySelector('#FailureParse').style.display = 'block'
                    setTimeout(()=>{
                        document.querySelector('#FailureParse').style.display = 'none'
                    }, 5000)
                    location.reload()
                }
            }, 0);

            WaitTimeoutFunc(ParserTimer)
        })

        ClickStopPropagation(btn)
    }

    if (PeopleSearchRet) {
        let SearchFlag = document.querySelector('div.search-box-researcher')

        if (SearchFlag) {
            let SearchList = SearchFlag.querySelectorAll('div.search-box__result-item')
            SearchList.forEach((val) => {
                RenderBTN(val)
            })

            let HistoryLength = 0
            document.querySelector('div.search-box-researcher').addEventListener('DOMNodeInserted', () => {
                let SearchList = document.querySelector('div.search-box-researcher').querySelectorAll('div.search-box__result-item')
                let SearchListLength = SearchList.length
                if (SearchListLength > HistoryLength) {
                    HistoryLength = SearchListLength
                    RenderBTN(SearchList[SearchListLength - 1])
                }
            })
        }
    }

    if (MemberSearchRet) {
        let SearchList = document.querySelector('div.nova-legacy-c-card__body').querySelectorAll('div.institution-members-list')
        SearchList.forEach((val) => {
            RenderBTN(val)
        })

        document.querySelector('div.nova-legacy-c-card__body').addEventListener('DOMNodeInserted', () => {
            let SearchList = document.querySelector('div.nova-legacy-c-card__body').querySelectorAll('div.institution-members-list')
            let LoadFlag = document.querySelector('div.nova-legacy-c-card__body').querySelector('a.TiC_btn')
            if (SearchList.length > 0 && !LoadFlag) {
                SearchList.forEach((val) => {
                    RenderBTN(val)
                })
            }
        })
    }

    if (!SelfURLRet && TalentURLRet) {
        const ParseButton = document.querySelector('.TiC_sidebar #ParseButton')
        ParseButton.addEventListener('click', async () => {
            if (ProfileURLRet) {
                let ParserTimer = setTimeout(async () => {
                    try {
                        await Parser(document.URL, false)
                    }
                    catch {
                        ResetParseInform(true)
                        document.querySelector('#FailureParse').style.display = 'block'
                        setTimeout(()=>{
                            document.querySelector('#FailureParse').style.display = 'none'
                        }, 5000)
                        location.reload()
                    }
                }, 0)

                WaitTimeoutFunc(ParserTimer)
            }
            else {
                const JumpURL = url.match(TalentURLPattern)[0]

                let ParserTimer = setTimeout(async () => {
                    try {
                        await Parser(JumpURL, true)
                    }
                    catch {
                        ResetParseInform(true)
                        document.querySelector('#FailureParse').style.display = 'block'
                        setTimeout(()=>{
                            document.querySelector('#FailureParse').style.display = 'none'
                        }, 5000)
                        location.reload()
                    }
                }, 0);

                WaitTimeoutFunc(ParserTimer)
            }
        })
    }
    else {
        NegativeParse()
    }
}



function main() {
    Preparation()


    if (DOMAIN === 'www.linkedin.com') {
        if (document.URL !== DOMAIN) {
            window.onload = async () => {
                let previousURL
                let PeopleSearchHistory = []
                let TalentURLHistory = [document.URL]
                const SearchPagePattern = /^https:\/\/www\.linkedin\.com\/search\/results\/people\/\?keywords=*/
                const TalentURLPattern = /https:\/\/www\.linkedin\.com\/in\/[^\/]+\/$/
                const TalentURLOverlayPattern = /https:\/\/www\.linkedin\.com\/in\/[^\/]+\/overlay\/contact-info\//

                const PeopleSearchPagePattern = /&sid=\w+$/g

                if (SearchPagePattern.test(document.URL)) {
                    PeopleSearchHistory.push(document.URL.replaceAll(PeopleSearchPagePattern, ''))
                }

                await LinkedInLoading()

                if (window.onurlchange === null) {
                    window.addEventListener('urlchange', async (event) => {
                        if (previousURL !== document.URL) {
                            TalentURLHistory.push(document.URL)
                            if ((TalentURLPattern.test(TalentURLHistory.slice(-2)[0]) && TalentURLOverlayPattern.test(TalentURLHistory.slice(-1)[0])) ||
                                (TalentURLPattern.test(TalentURLHistory.slice(-1)[0]) && TalentURLOverlayPattern.test(TalentURLHistory.slice(-2)[0]))) {}

                            else {
                                if (SearchPagePattern.test(document.URL)) {
                                    let CurrentURL = document.URL.replaceAll(PeopleSearchPagePattern, '')
                                    if (PeopleSearchHistory.includes(CurrentURL)) {
                                        location.assign(CurrentURL)
                                    }
                                    else {
                                        PeopleSearchHistory.push(CurrentURL)
                                    }
                                }
                                previousURL = document.URL
                                const OldSidebar = document.querySelector('.TiC_sidebar')
                                if (OldSidebar) {
                                    OldSidebar.remove()
                                }

                                await LinkedInLoading()
                            }

                        }
                    });
                }
            };
        }
    }


    if (DOMAIN === 'orcid.org') {
        (async () => {
            // const LogStatus = (await GetParseDetails(URL + '/userStatus.json')).loggedIn
            let previousURL

            if (window.onurlchange === null) {
                window.addEventListener('urlchange', async (event) => {
                    if (previousURL !== document.URL) {
                        let tempURL = previousURL
                        previousURL = document.URL

                        const OldSidebar = document.querySelector('.TiC_sidebar')
                        if (OldSidebar) {
                            OldSidebar.remove()
                        }

                        await ORCIDLoading(tempURL)
                    }
                });
            }
        })();
    }


    if (DOMAIN === 'scholar.google.com') {
        (async () => {
            await GoogleScholarLoading()
        })();
    }


    if (DOMAIN === 'www.researchgate.net') {
        window.onload = async () => {
            const LogStatus = document.querySelector('body.logged-out')

            if (!LogStatus) {
                let previousURL
                await ResearchGateLoading()

                if (window.onurlchange === null) {
                    window.addEventListener('urlchange', async (event) => {
                        if (previousURL !== document.URL) {
                            previousURL = document.URL
                            const OldSidebar = document.querySelector('.TiC_sidebar')
                            if (OldSidebar) {
                                OldSidebar.remove()
                            }
                            await ResearchGateLoading()
                        }
                    })
                }
            }
        }
    }
}


main()
