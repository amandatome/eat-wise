// API CALLS CONTROLLER
var APIController = (function() {
    // All javascript dealing with Zomato and Spoonacular APIs goes here
    var zomatoCuisineArray = [
        {
            "cuisine_id": 152,
            "cuisine_name": "African"
        },
        {
            "cuisine_id": 25,
            "cuisine_name": "Chinese"
        },
        {
            "cuisine_id": 60,
            "cuisine_name": "Japanese"
        },
        {
            "cuisine_id": 67,
            "cuisine_name": "Korean"
        },
        {
            "cuisine_id": 99,
            "cuisine_name": "Vietnamese"
        },
        {
            "cuisine_id": 95,
            "cuisine_name": "Thai"
        },
        {
            "cuisine_id": 148,
            "cuisine_name": "Indian"
        },
        {
            "cuisine_id": 133,
            "cuisine_name": "British"
        },
        {
            "cuisine_id": 135,
            "cuisine_name": "Irish"
        },
        {
            "cuisine_id": 45,
            "cuisine_name": "French"
        },
        {
            "cuisine_id": 55,
            "cuisine_name": "Italian"
        },
        {
            "cuisine_id": 73,
            "cuisine_name": "Mexican"
        },
        {
            "cuisine_id": 89,
            "cuisine_name": "Spanish"
        },
        {
            "cuisine_id": 137,
            "cuisine_name": "Middle Eastern"
        },
        {
            "cuisine_id": 265,
            "cuisine_name": "Jewish"
        },
        {
            "cuisine_id": 1,
            "cuisine_name": "American"
        },
        {
            "cuisine_id": 491,
            "cuisine_name": "Cajun"
        },
        {
            "cuisine_id": 471,
            "cuisine_name": "Southern"
        },
        {
            "cuisine_id": 156,
            "cuisine_name": "Greek"
        },
        {
            "cuisine_id": 134,
            "cuisine_name": "German"
        },
        {
            "cuisine_id": 651,
            "cuisine_name": "Eastern European"
        },
        {
            "cuisine_id": 158,
            "cuisine_name": "Caribbean"
        },
        {
            "cuisine_id": 136,
            "cuisine_name": "Latin American"
        }
    ];

    var numOfResults = 5;

    return {
        zomatoGetCityNumber: function(callback, city) {
            var queryURL, cityID;
            queryURL = 'https://developers.zomato.com/api/v2.1/locations?query=' + city;
              $.ajax({
                url: queryURL,
                method: 'GET',
                headers: {
                    'user-key':'df75e3e330c13e41814d56e42a276a03'
                },
                success: function(response) {
                    if (response.location_suggestions.length > 0) {
                        cityID = response.location_suggestions[0].entity_id;
                    } else {
                        cityID = false;
                    }
                    
                    callback(cityID);
                }
            });
        },
        zomatoSearch: function(callback, cityID, cuisine, diet, mealType) {
            var cuisineNum;

            switch (diet) {
                case 'pescatarian':
                    diet = 'fish';
                    break;
                case 'lacto vegetarian':
                    diet = 'vegetarian';
                    break;
                case 'ovo vegetarian':
                    diet = 'vegetarian';
                    break;
                default:
                    break;
            }

            for (var i = 0; i < zomatoCuisineArray.length; i++) {
                if (zomatoCuisineArray[i].cuisine_name === cuisine) {
                    cuisineNum = zomatoCuisineArray[i].cuisine_id;
                }
            }
            var queryURL = 'https://developers.zomato.com/api/v2.1/search?entity_id=' 
                            + cityID + '&entity_type=city&q=' + diet + '%20' + mealType 
                            + '&count=' + numOfResults + '&cuisines=' + cuisineNum;
            $.ajax({
                url: queryURL,
                method: 'GET',
                headers: {
                    'user-key': 'df75e3e330c13e41814d56e42a276a03'
                },
                success: function(response) {
                    var restoArr = [];
                    for (var i = 0; i < response.restaurants.length; i++) {
                        var resto = response.restaurants[i].restaurant;
                        var restoInfo = {
                            name: resto.name,
                            address: resto.location.address,
                            url: resto.url,
                            cuisines: resto.cuisines.split(', '),
                            avgCost: '$' + resto.average_cost_for_two,
                            userScore: resto.user_rating.rating_text
                        };
                        restoArr.push(restoInfo);
                    }
                    callback(restoArr);
                }
            });
        },
        spoonacularGetRecipeIDs: function(callback, cuisine, intolerances, type, diet) {
            var intolerancesString = "";
            cuisine = cuisine.replace(' ', '+');
            diet = diet.replace(' ', '+');
            for (var i = 0; i < intolerances.length; i++) {
                intolerancesString += intolerances[i];
                if (i !== intolerances.length - 1) {
                    intolerancesString += '%2C'
                }
            }
            if (type !== "breakfast") {
                type = "main+course";
            }
            var queryURL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?cuisine=' 
                            + cuisine + '&diet=' + diet + '&intolerances=' + intolerancesString 
                            + '&type=' + type + '&number=' + numOfResults + '&instructionsRequired=true&query=food';
            $.ajax({
                url: queryURL,
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": "fd24c4e1bamsh51cc6ab2c5a5849p1a9263jsn8e0025b690c2"
                },
                success: function(response) {
                    var recipeIDsArray = [];
                    for (var i = 0; i < response.results.length; i++) {
                        recipeIDsArray.push(response.results[i].id);
                        
                    }
                    callback(recipeIDsArray);
                }
            });
        },
        spoonacularGetRecipeInfo: function(callback, ID) {
            var queryURL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/' 
                            + ID + '/information?includeNutrition=true';
              $.ajax({
                url: queryURL,
                method: 'GET',
                headers: {
                    "X-RapidAPI-Key": "fd24c4e1bamsh51cc6ab2c5a5849p1a9263jsn8e0025b690c2"
                },
                success: function(response) {
                    var recipeInfo = {
                        title: response.title,
                        image: response.image,
                        prepTime: response.readyInMinutes + ' mins',
                        instructions: response.instructions,
                        url: response.spoonacularSourceUrl,
                        cals: response.nutrition.nutrients[0].amount,
                        protein: response.nutrition.nutrients[7].amount + ' g',
                        fat: response.nutrition.nutrients[1].amount + ' g'
                    }
                    if (recipeInfo.instructions) {
                        recipeInfo.instructions = recipeInfo.instructions.replace(/\s+/g,'  ').trim()
                    }
                    var ingredients = [];
                    for (let i = 0; i < response.extendedIngredients.length; i++) {
                        var ingredient = response.extendedIngredients[i];
                        ingredients.push(ingredient.original);
                    }
                    recipeInfo.ingredients = ingredients;
                    callback(recipeInfo);
                }
            });
        }
    };
})();