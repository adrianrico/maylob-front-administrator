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

export function navigateToView(originView,destinationView,classFlag,displayType)
{
    shrinkAnimation(originView,classFlag)
    setTimeout(function() 
    {
        growAnimation(destinationView,classFlag,displayType)
    }, 300)
}

export function goBackAnimation(currentView, previousView)
{
    var hideView = gsap.timeline({
        onComplete: function() 
        {
            $("#"+currentView+"").addClass('hidden');

            $("#"+previousView+"").removeClass('hidden');
   
            var displayView = gsap.timeline();
            
            displayView
            .fromTo('#'+previousView+'',{scale:0}, { duration: 0.15,scale:1.05})
            .fromTo('#'+previousView+'',{scale:1.05}, { duration: 0.15,scale:1})
        }
    });

    hideView
    .fromTo('#'+currentView+'',{scale:1}, { duration: 0.15,scale:1.05})
    .fromTo('#'+currentView+'',{scale:1.05}, { duration: 0.15,scale:0})
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

