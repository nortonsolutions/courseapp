module.exports = function(hbs) {

    hbs.registerHelper("booleanCheckboxHelper", function(boolean) {
        let str = "";
        if (boolean) str = "checked";
        return new hbs.SafeString(str);
      });
    
    hbs.registerHelper("plusOne", function(value) {
        return value+1;
    });

    hbs.registerHelper("limitLength", function(string) {
        if (string.length > 24) {
            return (string.substring(0,24) + '...');
        } else return string;
    });

    hbs.registerHelper("hideButton", function(button, currentQuestionNumber, totalQuestions) {
        switch (button) {
            case 'previous':
                if (currentQuestionNumber == 1) return 'd-none'; 
                break;
            case 'next':
                if (currentQuestionNumber == totalQuestions) return 'd-none';  
                break;
            case 'done':
                if (currentQuestionNumber != totalQuestions) return 'd-none'; 
                break;
        }
        return '';

    });

    hbs.registerHelper("disabledIf", function(boolean) {
        let str = '';
        if (boolean) str = "disabled";
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("hideIf", function(boolean) {
        let str = '';
        if (boolean) str = "d-none";
        return new hbs.SafeString(str);
    });

    hbs.registerHelper("shortDate", function(date) {
        return date.toLocaleDateString();
    });
}