const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.set('strictQuery', false);

const itemSchema={
    name:String
}
const Item=mongoose.model("item",itemSchema);
const item1= new Item({
    name:"welcome to your todo list"
})
const item2= new Item({
    name:"Hit the + button to add item"
})
const item3= new Item({
    name:"hit the button to delete item"
})
const defaultitems=[item1,item2,item3];
 
const listSchema={
    name:String,
    items:[itemSchema]
}

const List=mongoose.model("list",listSchema);

app.get("/", function (req, res) {
    Item.find(function(err,founditem){
       if(founditem===0){
          Item.insertMany(defaultitems,function(err){
    if(err){
        console.log(err)
    }
    else
    {
        console.log("success")
    }  res.redirect("/");
}); 
       } else{
        res.render("menu", {listTitle: "Today", itemsNew:founditem });
     } });
    

     
});
app.post("/",function(req,res){
    let newItem=req.body.itemList;
    const listName=req.body.list;
    const item= new Item({
        name:newItem
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
       List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
       })
    }


});
app.post("/delete",function(req,res){
   const checkedItem=req.body.checkBox;
   const listName=req.body.listName;
   if (listName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
        if (err){console.log(err);  }
           })
           res.redirect("/");
   }
   else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
 if(!err){res.redirect("/"+listName);}
    });
   }

});


app.get("/:customListName",function(req,res){
 const customName=_.capitalize(req.params.customListName);
 List.findOne({name:customName},function(err,foundList){
   if(!err){
    if(!foundList){
        //create a new list
        const list=new List({
            name:customName,
            item:defaultitems
         });
         list.save();
         res.redirect("/");
    }
    else{
        //show existing
        res.render("menu",{listTitle:foundList.name, itemsNew:foundList.items})
    }
   }
 })

});


app.get("/work",function(req,res){
  res.render("menu",{listTitle:"work list", itemsNew:workItems});
});
app.get("/about",function(req,res){
    res.render("about");
  });
// app.post("/work",function(req,res){
      
//     res.redirect("/work");
// });
app.listen(3000, function () {
    console.log("server is started");
});

//