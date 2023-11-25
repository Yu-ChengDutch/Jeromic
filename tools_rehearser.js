/***
 * 
 * Create prerequisites
 * 
 ***/

/* Create arrays */

var question_array = [];

var ancestry_dict = {};
var content_dict = {};
var terminals_array = [];

var original_dictionary = {};

var base = "";

/* Define the pages */

var level_page= `

    <script type="text/javascript" src="tools_rehearser.js"></script>
    
    <div class = "question-card">

        <div class="question-title-card" onClick="backToStart()">

            <h1 id="question-title">Question 1</h1>
            <p id ="question-description">What is the name of this disease?</p>
        
        </div>

        <div class="question-input-card" id="question-input-card">
            <input type="text" id="text-field">
            <input type="button" class="button" id ="check-button" value="Check" onclick="checkMnemonicAnswer()"> 
        </div>

        <div id="remark-card">
            
            <p id ="question-description"></p>
        
        </div>

    </div>

`

var page_order=`
<div class="card" onclick="startLevel(1)">

    <div class="bubble">
        <img src="./Images/Skeleton.png">
    </div>

    <div class="text-right">

        <H1> Bones </H1>
        <p> & other hard problems </p>

    </div>

</div>

<div class="card" onclick="startLevel(2)">

    <div class="bubble">
        <img src="./Images/Skeleton.png">
    </div>

    <div class="text-right">

        <H1> Muscles </H1>
        <p> & other moving subjects</p>

    </div>

</div>
`

var page_recognise =`

        <div class="inset"> <p> Major topics </p> </div>

`

var page_do =`

        <div class="inset"> <p> Preparation </p> </div>

`

var pages = {
    "order": page_order,
    "recognise": page_recognise,
    "do": page_do
};

var trivial_answers = ["Ja", "Nee", "Substraat", "Inhibitor", "Inducer"];

function toPage(page) {
    document.getElementById("main-container").innerHTML = pages[page];

    document.getElementById(page).style.setProperty("transition-duration", "0.5s");
    document.getElementById(page).style.setProperty("box-shadow", "0px 1vh 2vh 1vh rgba(173, 216, 230, 0.753)");
    document.getElementById(page).style.setProperty("padding-bottom", "3vh");
    document.getElementById(page).style.setProperty("border-bottom-width", "2vh");

    for (var i = 0; i < Object.keys(pages).length; i++) {

        if (Object.keys(pages)[i] != page) {

            placeholder_page = Object.keys(pages)[i]

            document.getElementById(placeholder_page).style.setProperty("box-shadow", "0px 0vh 0vh 0vh");
            document.getElementById(placeholder_page).style.setProperty("padding-bottom", "2vh");
            document.getElementById(placeholder_page).style.setProperty("border-bottom-width", "1vh");

        };

    };

}

/***
 * 
 * Create main functions
 * 
 ***/

function startLevel(level) {

    openFullscreen();
    document.getElementsByTagName("BODY")[0].innerHTML = level_page;
    setEnter();

    fetch("./data_anatomy.json")

    .then(function(response){
        console.log("- > File found and accessed");
        return response.json();
    })
    .then(function(data){

        original_dictionary = data;
        base = data.Naam;

    })
    .then(function(){
        console.log(original_dictionary);
        console.log("-> Starting level " + level.toString());    

        prepareComponents(level);
    })
    .then(function(){

        console.log("-> Prepared ancestry array");
        console.log(ancestry_dict);
        console.log("-> Prepared content array");
        console.log(content_dict);
        console.log("-> Prepared terminals array");
        console.log(terminals_array);

        prepareQuestions(level);
    })
    .then(function(){

        console.log("-> Prepared questions")
        console.log(question_array);

        setQuestions(); 
    });

    /* Check */

};

function prepareComponents(level) {

    console.log("- > Preparing components");

    if (level == 1) {
        var explorable_array = [original_dictionary["Subdivision"][0]];
    } else if (level == 2) {
        var explorable_array = [original_dictionary["Subdivision"][1]];
    } else {
        var explorable_array = [original_dictionary];
    };
    
    var temp_ancestry_dict = {};
    var temp_content_dict = {};
    var temp_terminals_array = [];

    while (explorable_array.length > 0) {

        explorable_item = explorable_array[0];

        console.log("Exploring " + explorable_item);

        parent_name = explorable_item["Name"];

        temp_content_dict[parent_name] = explorable_item;

        if (Object.keys(explorable_item).includes("Subdivision")) {

            /* I.e. explorable_item is non-terminal */

            for (var i = 0; i < explorable_item["Subdivision"].length; i++) {

                /* Push each child to explorable */

                explorable_array.push(explorable_item["Subdivision"][i]);

                var child_name = explorable_item["Subdivision"][i]["Name"];

                if (Object.keys(explorable_item["Subdivision"][i]).includes("Subdivision")) {

                    grand_children = [];

                    for (var j = 0; j < explorable_item["Subdivision"][i]["Subdivision"].length; j++) {

                        grand_children.push(explorable_item["Subdivision"][i]["Subdivision"][j]["Name"]);

                    };
                    
                    temp_ancestry_dict[child_name] = {"Parent": parent_name, "Children": grand_children}

                } else {
                    temp_ancestry_dict[child_name] = {"Parent": parent_name}
                }
                
                
            };

        } else {

            /* I.e. explorable_item is terminal*/

            temp_terminals_array.push(parent_name);

        };

        explorable_array.shift();
    
    };

    ancestry_dict = temp_ancestry_dict;
    content_dict = temp_content_dict;
    terminals_array= temp_terminals_array;

};

function prepareQuestions(level) {

    var temp_question_array = [];
    question_array = [];

    console.log("-> Preparing questions")
    console.log("- -> Level is: " + level)

    if (level == 1 || level == 2) {

        var local_ancestry_dict = ancestry_dict;

        for (var i = 0; i < Object.keys(local_ancestry_dict).length; i++) {

            child = Object.keys(local_ancestry_dict)[i];
            parent = local_ancestry_dict[child].Parent; 

            if (level == 1 || level == 2) {

                question_string = "Waar is " + child + " een onderdeel van?";
                temp_question_array.push({"Question": question_string, "Answer": parent });

            };            

            if (level == 100) {                
                
                if (Object.keys(local_ancestry_dict[child]).includes("Children")) {

                    question_string = child + " heeft " + (local_ancestry_dict[child]["Children"].length).toString() + " subdivisies. Noem ze allen.";
                    temp_question_array.push({"Question": question_string, "Answer": local_ancestry_dict[child]["Children"], "Nr_ans": local_ancestry_dict[child]["Children"].length});

                };                

            };
        
        };

    };

    if (level == 3) {

        keys = Object.keys(content_dict)

        for (var i = 0; i < keys.length; i++) {

            var current = content_dict[keys[i]].Naam
            var temp_temp_question_array = [];

            if (level == 3 && Object.keys(content_dict[keys[i]]).includes("Interacties")) {

                for (var j = 0; j < content_dict[keys[i]].Interacties.length; j++) {

                    current_interaction = content_dict[keys[i]].Interacties[j];

                    console.log(current_interaction);
                    console.log(shuffle(current_interaction.Interactant));

                    if (terminals_array.includes(current)) {
                        question_string = "Het tegelijk nemen van " + current + " en " + current_interaction.Interactant + " geeft risico op: ";
                        temp_temp_question_array.push({"Question": question_string, "Answer": current_interaction.Risico });
                    } else {

                        current_child = shuffle(ancestry_dict[current].Children)[0]

                        question_string = "Het tegelijk nemen van bijv. " + current_child + " en " + current_interaction.Interactant + " geeft risico op: ";
                        temp_temp_question_array.push({"Question": question_string, "Answer": current_interaction.Risico });
                        // temp_temp_question_array.push(ancestryQuestion(current_child));
                    }
                    
                    temp_question_array.push(temp_temp_question_array);                    

                };                

            };

        }

    };

    if (level == 11 || level == 12) {

        console.log("Preparing question 11 or 12");

        keys = Object.keys(content_dict)

        for (var i = 0; i < keys.length; i++) {

            var current = content_dict[keys[i]].Naam
            var temp_temp_question_array = [];

            if (Object.keys(content_dict[keys[i]]).includes("Bijwerkingen")) {

                var current_side_effects = recursiveSideEffects(keys[i]);

                if (level == 11) {

                    if (terminals_array.includes(current)) {
                        question_string = "Van welk medicijn is dit het bijwerkingenprofiel: " + current_side_effects;
                    } else {
                        question_string = "Van welk klasse medicijn is dit het bijwerkingenprofiel: " + current_side_effects;
                    };

                    temp_temp_question_array.push({"Question": question_string, "Answer": current});

                } else {

                    if (terminals_array.includes(current)) {
                        current_string = current;
                    } else {
                        current_string = current + " zoals bijv. " + shuffle(ancestry_dict[current].Children)[0]
                    }

                    if (current_side_effects.length > 3) {
                        question_string = current_string + " heeft tenminste " + (current_side_effects.length).toString() + " potentiële bijwerkingen. Noem er 3.";
                        temp_temp_question_array.push({"Question": question_string, "Answer": current_side_effects, "Nr_ans": 3});                    
                    } else {
                        question_string = current_string + " heeft tenminste " + (current_side_effects.length).toString() + " potentiële bijwerkingen. Noem ze.";
                        temp_temp_question_array.push({"Question": question_string, "Answer": current_side_effects, "Nr_ans": current_side_effects.length});
                    };                    

                };           

                if (Math.random() > 0.9 && temp_temp_question_array.length > 0) {

                    temp_temp_question_array.push(ancestryQuestion(current));
    
                };

                temp_question_array.push(temp_temp_question_array);

            };

        };

    };

    if (level == 4 || level == 8 || level == 5 || level == 7 || level == 18 || level == 9 || level == 10 || level == 16) {

        keys = Object.keys(content_dict)

        for (var i = 0; i < keys.length; i++) {

            var current = content_dict[keys[i]].Naam
            var temp_temp_question_array = [];

            if (terminals_array.includes(current)) {
                question_string_middle = " ";
            } else {
                question_string_middle = " klasse ";
            };

            if (level == 4 && Object.keys(content_dict[keys[i]]).includes("Indicaties-list")) {

                question_string = "Welk" + question_string_middle + "medicijn is bruikbaar voor de volgende symptomen: " + content_dict[keys[i]]["Indicaties-list"];
                temp_temp_question_array.push({"Question": question_string, "Answer": current });

            } else if (level == 5 && Object.keys(content_dict[keys[i]]).includes("Mechanisme")) {
            
                question_string = "Welk" + question_string_middle + "medicijn werk op de volgende manier: " + content_dict[keys[i]].Mechanisme;
                temp_temp_question_array.push({"Question": question_string, "Answer": current });

            } else if (level == 7 && Object.keys(content_dict[keys[i]]).includes("Zwangerschap")) {
            
                question_string = "Welk categorie valt " + current + " in wat betreft teratologie?";
                temp_temp_question_array.push({"Question": question_string, "Answer": content_dict[keys[i]].Zwangerschap[0]});

            } else if (level == 9 && Object.keys(content_dict[keys[i]]).includes("Enzym")) {
            
                enzym = content_dict[keys[i]].Enzym;

                question_string = "Het" + question_string_middle + "medicijn " + current + " werkt in op " + enzym[0] + ". Is het een enzyminducer, inhibitor of substraat?";
                temp_temp_question_array.push({"Question": question_string, "Answer": enzym[1]});

            } else if (level == 8) {

                if (Object.keys(content_dict[keys[i]]).includes("Voorschrijven")) {
                    
                    question_string = "Moet bij " + current + " de reden van voorschrijven worden vermeld? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Ja"})

                } else if (terminals_array.includes(current) && Math.random() > 0.7) {

                    question_string = "Moet bij " + current + " de reden van voorschrijven worden vermeld? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Nee"})

                }

            } else if (level == 16) {

                if (Object.keys(content_dict[keys[i]]).includes("Rijveiligheid")) {
                    
                    question_string = "Binnen welke rijveiligheidscategorie valt " + current + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": content_dict[keys[i]].Rijveiligheid})

                } else if (terminals_array.includes(current) && Math.random() > 0.7) {

                    question_string = "Binnen welke rijveiligheidscategorie valt " + current + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Categorie 0"})

                };

            } else if (level == 10) {

                if (Object.keys(content_dict[keys[i]]).includes("Klaring") || Object.keys(content_dict[ancestry_dict[current].Parent]).includes("Klaring")) {
                    
                    question_string = "Moet bij " + current + " de dosis worden aangepast bij nierfunctiestoornissen? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Ja"})

                } else if (terminals_array.includes(current) && Math.random() > 0.7) {

                    question_string = "Moet bij " + current + " de dosis worden aangepast bij nierfunctiestoornissen? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Nee"})

                }

            } else if (level == 18) {

                if (Object.keys(content_dict[keys[i]]).includes("Werkingsduur")) {
                    
                    question_string = "Wat is de werkingsduur van " + current + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": content_dict[keys[i]].Werkingsduur})

                };

            };
            
            if (Math.random() > 0.9 && temp_temp_question_array.length > 0) {

                temp_temp_question_array.push(ancestryQuestion(current));

            };   
            
            temp_question_array.push(temp_temp_question_array);

        };

    };

    if (level == 14 || level == 15) {

        var local_ancestry_dict = ancestry_dict;

        for (var i = 0; i < Object.keys(local_ancestry_dict).length; i++) {

            child = Object.keys(local_ancestry_dict)[i];
            parent = local_ancestry_dict[child].Parent; 
            question_string_middle = " ";

            temp_temp_question_array = [];

            if (parent != base) {

                if (level == 15) {

                    if (Math.random() > 0.5 && Object.keys(content_dict[child]).includes("Indicaties-list")) {

                        question_string = "Welk" + question_string_middle + "medicijn is bruikbaar voor de volgende symptomen: " + (content_dict[child]["Indicaties-list"]).join(", ");
                        temp_temp_question_array.push({"Question": question_string, "Answer": child });
        
                    } else if (Object.keys(content_dict[child]).includes("Mechanisme")) {
                    
                        question_string = "Welk" + question_string_middle + "medicijn werk op de volgende manier: " + (content_dict[child].Mechanisme).join(", ");
                        temp_temp_question_array.push({"Question": question_string, "Answer": child });
        
                    };
                };   

                question_string = "Wat is de klasse van " + child;                
                temp_temp_question_array.push({"Question": question_string, "Answer": parent });

                if (level == 15 && Object.keys(content_dict[child]).includes("Interacties")) {

                    current_interaction = shuffle(content_dict[child].Interacties)[0]

                    if (terminals_array.includes(child)) {
                        question_string = "Het tegelijk nemen van " + child + " en " + current_interaction.Interactant + " geeft risico op: ";
                        temp_temp_question_array.push({"Question": question_string, "Answer": current_interaction.Risico });
                    } else {

                        current_child = shuffle(ancestry_dict[child].Children)[0]

                        question_string = "Het tegelijk nemen van " + child + " zoals bijv. " + current_child + " en " + current_interaction.Interactant + " geeft risico op: ";
                        temp_temp_question_array.push({"Question": question_string, "Answer": current_interaction.Risico });
                    }

                };
                
                if (Object.keys(content_dict[child]).includes("Voorschrijven")) {
                    
                    question_string = "Moet bij " + child + " de reden van voorschrijven worden vermeld? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Ja"})

                } else if (terminals_array.includes(child) && Math.random() > 0.8) {

                    question_string = "Moet bij " + child + " de reden van voorschrijven worden vermeld? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Nee"})

                };

                if (Object.keys(content_dict[child]).includes("Klaring")) {
                    
                    question_string = "Moet bij " + child + " de dosis worden aangepast bij nierfunctiestoornissen? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Ja"})

                } else if (terminals_array.includes(child) && Math.random() > 0.8) {

                    question_string = "Moet bij " + child + " de dosis worden aangepast bij nierfunctiestoornissen? Ja of nee";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Nee"})

                };

                if (Object.keys(content_dict[child]).includes("Zwangerschap")) {
            
                    question_string = "Welk categorie valt " + child + " in wat betreft teratologie?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": content_dict[child].Zwangerschap[0]});
    
                } else if (terminals_array.includes(child) && Math.random() > 0.8) {

                    question_string = "Welk categorie valt " + child + " in wat betreft teratologie?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Onbekend"})

                }; 

                if (Object.keys(content_dict[child]).includes("Rijveiligheid")) {
                    
                    question_string = "Binnen welke rijveiligheidscategorie valt " + child + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": content_dict[child].Rijveiligheid})

                } else if (terminals_array.includes(child) && Math.random() > 0.8) {

                    question_string = "Binnen welke rijveiligheidscategorie valt " + child + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "0"})

                };
                
                if (Object.keys(content_dict[child]).includes("Enzym")) {
                
                    enzym = content_dict[child].Enzym;

                    question_string = "Zijn enzymen van belang in het voorschrijven van " + child + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Ja"});
    
                    question_string = "Het" + question_string_middle + "medicijn " + child + " werkt in op " + enzym[0] + ". Is het een enzyminducer, inhibitor of substraat?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": enzym[1]});
                
                } else if (terminals_array.includes(child) && Math.random() > 0.8) {

                    question_string = "Zijn enzymen van belang in het voorschrijven van " + child + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": "Nee"})

                };
                
                if (Object.keys(content_dict[keys[i]]).includes("Werkingsduur")) {
                    
                    question_string = "Wat is de werkingsduur van " + current + "?";
                    temp_temp_question_array.push({"Question": question_string, "Answer": content_dict[keys[i]].Werkingsduur})

                };

                if (Object.keys(content_dict[child]).includes("Bijwerkingen")) {

                    var current_side_effects = recursiveSideEffects(child);
                    var current_string = "";

                    console.log(current_side_effects);

                    if (current_side_effects.length > 0) {

                        if (terminals_array.includes(child)) {
                            current_string = child;
                        } else {
                            current_string = child + " zoals bijv. " + shuffle(ancestry_dict[child].Children)[0]
                        }

                        if (current_side_effects.length > 3) {
                            question_string = current_string + " heeft tenminste " + (current_side_effects.length).toString() + " potentiële bijwerkingen. Noem er 3.";
                            temp_temp_question_array.push({"Question": question_string, "Answer": current_side_effects, "Nr_ans": 3});                    
                        } else {
                            question_string = current_string + " heeft tenminste " + (current_side_effects.length).toString() + " potentiële bijwerkingen. Noem ze.";
                            temp_temp_question_array.push({"Question": question_string, "Answer": current_side_effects, "Nr_ans": current_side_effects.length});
                        }; 

                    };
                };

                temp_question_array.push(temp_temp_question_array);

            };
        
        };

    };

    console.log(temp_question_array);
    question_array = (shuffle(temp_question_array)).flat(1);

};

function setQuestions(){

    console.log("- > Setting first question")

    document.getElementById('question-title').innerText = "0/" + question_array.length;
    document.getElementById('question-description').innerText = question_array[0].Question
    document.getElementById('remark-card').innerText = "Please enter the mnemonic phrase"

};

function recursiveSideEffects(current) {

    if (Object.keys(content_dict[current]).includes("Bijwerkingen")) {

        var current_side_effects = [];

        for (var j = 0; j < content_dict[current].Bijwerkingen.length; j++) {

            current_side_effects.push(content_dict[current].Bijwerkingen[j].Bijwerking)   

        };

        par_obj = ancestry_dict[current].Parent;

        if (Object.keys(content_dict[par_obj]).includes("Bijwerkingen")) {

            for (var j = 0; j < content_dict[par_obj].Bijwerkingen.length; j++) {

                current_side_effects.push(content_dict[par_obj].Bijwerkingen[j].Bijwerking)   

            };

            console.log(par_obj);

            if (Object.keys(ancestry_dict[par_obj]).includes("Parent")) {

                if (Object.keys(content_dict[ancestry_dict[par_obj].Parent]).includes("Bijwerkingen")) {

                    for (var j = 0; j < (content_dict[ancestry_dict[par_obj].Parent]).Bijwerkingen.length; j++) {

                        current_side_effects.push((content_dict[ancestry_dict[par_obj].Parent]).Bijwerkingen[j].Bijwerking)   
    
                    };

                };
            };

        };                  

    };

    return current_side_effects;

};

function checkMnemonicAnswer() {

    // There are basically two options: either we're checking the mnemonic, 
    // or the individual elements

    const textfield = document.getElementById('text-field');    
    const given_answer = textfield.value;

    indices = (document.getElementById('question-title').innerText).split("/")
    current_index = indices[0];

    correct_answer = question_array[current_index].Answer; 
    nr_ans = question_array[current_index].Nr_ans;
    
    console.log("- - > Checking mnemonic")
    console.log("- - > Right answer is: " + correct_answer)

    if (given_answer != "" && given_answer != null && given_answer != undefined) {

        if (Array.isArray(correct_answer) && !(question_array[current_index].Question).includes("voorbeeld")) {

            console.log("Is array!")

            if (correct_answer.includes(given_answer)) {

                console.log("Correct!");

                const textfield = document.getElementById('text-field');
                textfield.value = "";

                inner_text = document.getElementById('remark-card').innerText;

                if (nr_ans == 1 || (inner_text.includes("1") && nr_ans == 2) || (inner_text.includes("2") && nr_ans == 3)) {

                    inBetween(correct_answer);

                } else {

                    if (inner_text.includes("1")) {

                        document.getElementById('remark-card').innerText = document.getElementById('remark-card').innerText + " || 2. " + given_answer;
        
                    } else {
        
                        document.getElementById('remark-card').innerText = "1. " + given_answer;
        
                    };

                };
                

            } else {

                console.log("False!")

                document.getElementById('remark-card').innerText = "False! The correct answers are: " + correct_answer + ". We'll repeat this question."

                let local_question_array = question_array;
                local_question_array.splice(intervalIndex(current_index, 4, local_question_array), 0, {"Question": ("Dit is een herhaling: " + question_array[current_index].Question), "Answer": question_array[current_index].Answer, "Nr_ans": question_array[current_index].Nr_ans});
                local_question_array.splice(intervalIndex(current_index, 12, local_question_array), 0, {"Question": ("Dit is een herhaling: " + question_array[current_index].Question), "Answer": question_array[current_index].Answer, "Nr_ans": question_array[current_index].Nr_ans});

                question_array = local_question_array;
                console.log(question_array);

            }

        } else if (given_answer.toLowerCase() == correct_answer.toString().toLowerCase() || correct_answer.includes(given_answer)) {

            console.log("- - > Correct!")

            if (document.getElementById('question-description').innerText.includes("Noem een voorbeeld van") && !terminals_array.includes(given_answer)) {

                let local_question_array = question_array;

                try {
                    local_question_array.splice(intervalIndex(current_index, 1, local_question_array), 0, ancestryQuestion(given_answer));
                } catch {
                    console.log("--> Doesn't exist: " + given_answer);
                };
                
                question_array = local_question_array;

            } else if (document.getElementById('question-description').innerText.includes("Van welke categorie is") && ancestry_dict[given_answer].Parent != base) {

                let local_question_array = question_array;

                try {
                    question_string = "Van welke categorie is " + given_answer + " een deel?";
                    local_question_array.splice(intervalIndex(current_index, 1, local_question_array), 0, {"Question": question_string, "Answer": ancestry_dict[given_answer].Parent});
                } catch {
                    console.log("--> Doesn't exist: " + given_answer);
                };
                
                question_array = local_question_array;

            };         

            nextQuestion();

        } else {

            console.log("- - > Given answer: " + given_answer);
            console.log("- - > Right answer: " + correct_answer);

            if (document.getElementById('remark-card').innerText != "Please repeat the answer" && !trivial_answers.includes(correct_answer)) {
                
                document.getElementById('remark-card').innerText = "Please repeat the answer";
            
            } else {

                document.getElementById('remark-card').innerText = "Het goede antwoord is: " + correct_answer + ". We zullen deze vraag later nogmaals herhalen.";

                let local_question_array = question_array;
                local_question_array.splice(intervalIndex(current_index, 4, local_question_array), 0, {"Question": ("Dit is de eerste herhaling: " + question_array[current_index].Question), "Answer": question_array[current_index].Answer});
                local_question_array.splice(intervalIndex(current_index, 12, local_question_array), 0, {"Question": ("Dit is de tweede herhaling: " + question_array[current_index].Question), "Answer": question_array[current_index].Answer});

                question_array = local_question_array;
                console.log(question_array);

            }

            
            textfield.value = "";            

        }
    } else {

        document.getElementById('remark-card').innerText = "Het goede antwoord is: " + correct_answer + ". We zullen deze vraag later nogmaals herhalen.";

        let local_question_array = question_array;
        local_question_array.splice(intervalIndex(current_index, 4, local_question_array), 0, {"Question": ("Dit is de eerste herhaling: " + question_array[current_index].Question), "Answer": question_array[current_index].Answer});
        local_question_array.splice(intervalIndex(current_index, 12, local_question_array), 0, {"Question": ("Dit is de tweede herhaling: " + question_array[current_index].Question), "Answer": question_array[current_index].Answer});

        question_array = local_question_array;
        console.log(question_array);

    }
}

function nextQuestion() {

    resetButtons();

    const textfield = document.getElementById('text-field');
    textfield.value = "";

    indices = (document.getElementById('question-title').innerText).split("/")

    current_index = indices[0];

    if (current_index < (question_array.length - 1)) {
        new_index = parseInt(current_index) + 1;
    } else {
        new_index = 0;
    }
    
    /* Setting all new text */

    document.getElementById('remark-card').innerText = "Please enter the mnemonic phrase." 
    document.getElementById('question-description').innerText = question_array[new_index].Question
    document.getElementById('question-title').innerText = new_index + "/" + question_array.length;

};

function inBetween(display_text) { 

    resetButtons();

    const textfield = document.getElementById('text-field');
    textfield.value = "";
    
    /* Setting all new text */

    document.getElementById('remark-card').innerText = "Super goed gedaan!" 
    document.getElementById('question-description').innerText = "Goed gedaan! Ter herhaling: het volledige antwoord was: " + display_text.join(", ")
    
    document.getElementById('question-input-card').innerHTML = 
            
    `

    <input type="button" class="button" id ="check-button" value="Next" onclick="nextQuestion()">
    
    `;

    setEnter();

};

/***
 * 
 * Utilities: All utility functions are pushed to the bottom for saving space
 * 
 ***/

/* Finds the possible next index */

function intervalIndex(current_index, desired_interval, array) {

    let length = array.length;
    let temp_current_index = parseInt(current_index);
    let temp_desired_interval = parseInt(desired_interval);

    if (temp_current_index + temp_desired_interval < length) {
        return (temp_current_index + temp_desired_interval)
    } else {
        return ((temp_current_index + temp_desired_interval) - length)
    }

}

/* Shuffle arrays */

function ancestryQuestion(current) {

    try {
        if (terminals_array.includes(current)) {

            question_string = "Van welke categorie is " + current + " een deel?";
            return {"Question": question_string, "Answer": ancestry_dict[current].Parent }

        } else {

            question_string = "Noem een voorbeeld van " + current;
            return {"Question": question_string, "Answer": ancestry_dict[current].Children }

        }

    } catch {
        console.log("Issues with: " + current)
    }

};

/* Shuffles arrays */

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

/* Resets buttons to original */

function resetButtons() {
    
    document.getElementById('question-input-card').innerHTML = 
            
    `
    
    <input type="text" id="text-field">
    <input type="button" class="button" id ="check-button" value="Check" onclick="checkMnemonicAnswer()">
    
    `;

    setEnter();

}

/* Resets the screen back to the start screen */

function backToStart() {
    openFullscreen();

    document.getElementsByTagName("BODY")[0].innerHTML = landing_page;
}

/* Set a listener function for enter */

function setEnter() {

    var input = document.getElementById("text-field");

    // Execute a function when the user presses a key on the keyboard
    input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        console.log("-> Pressed enter")
        // Trigger the button element with a click
        checkMnemonicAnswer();
    }
    });

}

/* Set to full screen mode */

function openFullscreen() {

    var elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
}

/* From the old function in order to expand mnemonic */

function expandMnemonic() {

    const current_index = parseInt(document.getElementById('question-title').innerText);
    const textfield = document.getElementById('text-field');

    const keys = Object.keys(question_array[current_index].Mnemonic)

    document.getElementById('question-title').innerText = current_index.toString() + ".1"
    document.getElementById('question-description').innerText = "What is the meaning of: " + keys[1]
    document.getElementById('remark-card').innerText = "Please enter the answer"

    resetButtons();

    textfield.value = "";

}

/**
 * 
 * Back-up
 * 
 **/

function legacy(level) {

    console.log("- > Preparing questions");

    explorable_array = shuffle(data.Onderverdeling);

    while (explorable_array.length > 0) {

        explorable_item = explorable_array.pop();

        if (Object.keys(explorable_item).includes("Indicaties-list")) {
        
            if (Object.keys(explorable_item).includes("Onderverdeling")) {
                question_string_1 = "Welk (klasse) medicijn is bruikbaar voor de volgende symptomen: " + explorable_item["Indicaties-list"];
                question_string_2 = "Noem een voorbeeld van " + explorable_item.Naam;

                answer_array = [];

                for (var i = 0; i < explorable_item.Onderverdeling.length; i++) {
                    answer_array.push(explorable_item.Onderverdeling[i].Naam);
                }

                temp_3_array.push([{"Question": question_string_1, "Answer": explorable_item.Naam}, {"Question": question_string_2, "Answer": answer_array}])

            } else {
                question_string = "Welk (klasse) medicijn is bruikbaar voor de volgende symptomen: " + explorable_item["Indicaties-list"];
                temp_3_array.push({"Question": question_string, "Answer": explorable_item.Naam})
            }        

        }

        if (Object.keys(explorable_item).includes("Interacties")) {

            if (Object.keys(explorable_item).includes("Onderverdeling") && explorable_item.Onderverdeling.length > 1) {

                class_1 = explorable_item.Naam;
                original_med_1 = explorable_item.Onderverdeling

            } else {

                med_1 = explorable_item.Naam;
                class_1 = "";

            }

            for (var i = 0; i < explorable_item.Interacties.length; i++) {

                for (var j = 0; j < explorable_item.Interacties[i].Interactant.length; j++) {

                    var med_2 = explorable_item.Interacties[i].Interactant[j]

                    if (class_1 != "") {

                        med_1 = original_med_1[Math.floor(Math.random() * original_med_1.length)].Naam;

                        question_string_class = "Dit geldt niet sec voor " + med_1 + ", maar voor de gehele klassie. Wat is de klasse van " + med_1 + "?";

                        question_string_inter = "Als we " + med_1 + " en " + med_2 + " tegelijk nemen, op welke interactie verhogen we dan het risico?";
                        
                        rand_pos = Math.floor(Math.random() * temp_2_array.length)

                        temp_2_array.push([{"Question": question_string_inter, "Answer": explorable_item.Interacties[i].Risico}, {"Question": question_string_class, "Answer": class_1 }])
                        
                    } else {

                        question_string = "Als we " + med_1 + " en " + med_2 + " tegelijk nemen, op welke interactie verhogen we dan het risico?";
                        temp_2_array.push({"Question": question_string, "Answer": explorable_item.Interacties[i].Risico})

                    }              

                };

            };

        };

        if (Object.keys(explorable_item).includes("Onderverdeling")) {

            var class_name = explorable_item.Naam;

            for (var i = 0; i < explorable_item.Onderverdeling.length; i++) {

                if (Object.keys(explorable_item.Onderverdeling[i]).includes("Onderverdeling") || Object.keys(explorable_item.Onderverdeling[i]).includes("Interacties")) {
                    explorable_array.push(explorable_item.Onderverdeling[i])
                };

                question_string = "Wat is de klasse van " + explorable_item.Onderverdeling[i].Naam;
                temp_1_array.push({"Question": question_string, "Answer": class_name });
                
            };

        };

    };

    level1_question_array = shuffle(temp_1_array);
    level2_question_array = (shuffle(temp_2_array)).flat(1);
    level3_question_array = (shuffle(temp_3_array)).flat(1);

    console.log("- -> Prepared level 1 questions: order")
    console.log(level1_question_array);
    console.log("- -> Prepared level 2 questions: interactions")
    console.log(level2_question_array);
    console.log("- -> Prepared level 2 questions: indications")
    console.log(level3_question_array);

};


