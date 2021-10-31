/* Register Handlebars helpers for views */
function registerHandlebarsHelpers() {
    Handlebars.registerHelper("maleCheck", function(data) {
      let str = "";
      if (data === "m") str = "checked";
      return new Handlebars.SafeString(str);
    });
  
    Handlebars.registerHelper("femaleCheck", function(data) {
      let str = "";
      if (data === "f") str = "checked";
      return new Handlebars.SafeString(str);
    });
  
    Handlebars.registerHelper("roleCompare", function(role, compareRole) {
      let str = "";
      if (role === compareRole) str = "selected";
      return new Handlebars.SafeString(str);
    });
  
    Handlebars.registerHelper("verifiedHelper", function(verified) {
      let str = "";
      if (verified) str = "checked";
      return new Handlebars.SafeString(str);
    });
  
    Handlebars.registerHelper("iconize", function(data) {
      let str;
  
      switch (data) {
        case "m":
          str = "<i class='fa fa-male' aria-hidden='true'></i>";
          break;
        case "f":
          str = "<i class='fa fa-female' aria-hidden='true'></i>";
          break;
        default:
          str = "?";
      }
      return new Handlebars.SafeString(str);
    });
  }
  
  registerHandlebarsHelpers();