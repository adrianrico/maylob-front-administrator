//#region fade animations...

export function fadeInAnimation(view2FadeIn, byID)
{   
    var displayView = gsap.timeline();

    if(byID)
    {
        $("#"+view2FadeIn+"").removeClass('hidden');
        displayView.fromTo('#'+view2FadeIn+'',{opacity:0}, { duration: 0.25,opacity:1})
    }else
    {
        $("."+view2FadeIn+"").removeClass('hidden');
        displayView.fromTo('.'+view2FadeIn+'',{opacity:0}, { duration: 0.25,opacity:1})
    }
}

export function fadeOutAnimation(view2FadeOut, byID)
{   
    var displayView = gsap.timeline();

    if(byID)
    {
        $("#"+view2FadeOut+"").removeClass('hidden');
        displayView.fromTo('#'+view2FadeOut+'',{opacity:0}, { duration: 0.25,opacity:1})
    }else
    {
        $("."+view2FadeOut+"").removeClass('hidden');
        displayView.fromTo('.'+view2FadeOut+'',{opacity:0}, { duration: 0.25,opacity:1})
    }
}

export function changeViewTitle(viewID,viewTitle) 
{
    setTimeout(function() 
    {
        $("#"+viewID+"").text(viewTitle)
        fadeInAnimation(viewID,true)
    }, 250)  
}

//#endregion fade animations...

export function growAnimation(view2display,byClass,displayType)
{
    if (byClass) 
    {
        $("#"+view2display+"").removeClass('hidden');
   
        var displayView = gsap.timeline();
        
        displayView
        .fromTo('#'+view2display+'',{scale:0}, { duration: 0.15,scale:1.05})
        .fromTo('#'+view2display+'',{scale:1.05}, { duration: 0.15,scale:1})
    } else 
    {
        $("#"+view2display+"").css('display',displayType);
   
        var displayView = gsap.timeline();
        
        displayView
        .fromTo('#'+view2display+'',{scale:0}, { duration: 0.15,scale:1.05})
        .fromTo('#'+view2display+'',{scale:1.05}, { duration: 0.15,scale:1})
    }
}

export function shrinkAnimation(view2hide,byClass)
{ 
    if (byClass)
    {
        let shrinkView = gsap.timeline({
            onComplete: function() 
            {
                $("#"+view2hide+"").addClass('hidden');
            }
        });
    
        shrinkView
        .fromTo('#'+view2hide+'',{scale:1}, { duration: 0.15,scale:1.05})
        .fromTo('#'+view2hide+'',{scale:1.05}, { duration: 0.15,scale:0})

    } else 
    {
        let shrinkView = gsap.timeline({
            onComplete: function() 
            {
                $("#"+view2hide+"").css('display','none');
            }
        });
    
        shrinkView
        .fromTo('#'+view2hide+'',{scale:1}, { duration: 0.15,scale:1.05})
        .fromTo('#'+view2hide+'',{scale:1.05}, { duration: 0.15,scale:0})
    }
}





//#region [ NAVIGATION FUNCTIONS ]

export function navigateToView(originView,destinationView,classFlag,displayType)
{
    //Display NAVBAR with the needed buttons only...
    displayNavBar(destinationView)

    //Animations only...
    shrinkAnimation(originView,classFlag)
    setTimeout(function() 
    {
        growAnimation(destinationView,classFlag,displayType)
    }, 300)

    return destinationView
}

//#endregion [ NAVIGATION FUNCTIONS ]
/****************************************************************************************************************/





//#region [ SPECIFIC DISPLAY ANIMATIONS ]

function displayNavBar(actualPage)
{
    if (actualPage === 'homePage') 
    {
        shrinkAnimation('navBarView',false)
    }else
    {
        setTimeout(function() 
        {
            //To display only needed NAVBAR buttons...
            switch (actualPage) 
            {
                case 'maneuversPage':
                    $('#goBack_btn').css('display','flex')
                    $('#save_btn').css('display','none')
                    $('#filter_btn').css('display','flex')
                break;

                case 'addManeuverPage':
                    $('#goBack_btn').css('display','flex')
                    $('#save_btn').css('display','flex')
                    $('#filter_btn').css('display','none')
                break;
            
                default: break;
            }
            
            growAnimation('navBarView',false,'flex')
            growAnimation('navBar',false,'flex')
        }, 300)
    }
}




export function animateTruck(run)
{
    var truckTL = gsap.timeline({ repeat: -1 });

    if (!run)
    {
        truckTL.kill();
    }else
    {
        truckTL
        .fromTo('#truck',{y:0}, { duration: 0.1,y:1.15})
        .fromTo('#truck',{y:1.15}, { duration: 0.1,y:0})
    }
}

//#endregion [ SPECIFIC DISPLAY ANIMATIONS ]
/****************************************************************************************************************/
