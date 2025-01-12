import * as animationFunction from '/js/gsap/indexAnimations.js';

//#region [ INITIAL VIEW ]

var viewHistory = []
var actualView  = ""

/** FORWARD NAVIGATION */
$('#go2addEquipment').click(function()
{
    animationFunction.navigateToView('homePage','addEquipmentPage',false,'flex')
    animationFunction.growAnimation('navBar',false,'flex')

    viewHistory.push('homePage')
    actualView = 'addEquipmentPage'
});

/** FORWARD NAVIGATION */
$('#go2addManeuvers').click(function()
{
    getAvailableManeuvers()

    animationFunction.forwardNavigation('initialView','formStep_A')
    animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 1.')
});

/** FORWARD NAVIGATION */
$('#go2maneuversID').click(function()
{
    $('#maneuversList').empty()
    getAllManeuversID()

    animationFunction.navigateToView('homePage','maneuversPage',false,'flex')
    animationFunction.growAnimation('navBar',false,'flex')

    viewHistory.push('homePage')
    actualView = 'maneuversPage'    
});

/** FORWARD NAVIGATION */
$('#go2moni').click(function()
{
    animationFunction.forwardNavigation('initialView','moniSearch')
    animationFunction.changeViewTitle('bannerText_prompt','Monitor')
});

//#endregion [ INITIAL VIEW ]





//#region [ ADD EQUIPMENT VIEW ]

$('#saveEquipment').click(function()
{
    /** - Step [1]
    *   - Validate required data before AJAX request...
    */
    let objectID     = $('#objectID').val().trim()
    
    if (!validateField(objectID))
    {
        $('#errorToastPrompt').text("⛟ ID NO VÁLIDO.")
        $('#errorToastPrompt').append("<p>🛈 Por favor revisa el ID ingresado.</p>")
        $('.toast-error').css('display','grid').hide().fadeIn(200).delay(1100).fadeOut(200)
        
        //Error ID input...
        $('#objectID').addClass('error-color')
    }else
    { 
        //Error ID input remove...
        $('#objectID').removeClass('error-color')
        
        /** - Step [2]
         *  - Gather data to be sent...
         */

        let objectAvailability = 0

        $('#objectAvailableCheck').prop('checked') ? 
        objectAvailability  = 1
        :
        objectAvailability  = 0

        let objectCategory = $('#objectCategory').val()
        let objectPlates   = $('#objectPlates').val().trim().toUpperCase()

        if (objectCategory!='DOLLY') 
        {
            if(!validateField(objectPlates)) 
            {
                $('#errorToastPrompt').text("⛟ PLACAS no válidas.")
                $('#errorToastPrompt').append("<p>🛈 Por favor revisa el dato de las placas.</p>")
                $('.toast-error').css('display','grid').hide().fadeIn(200).delay(1100).fadeOut(200)
                
                //Error plates input...
                $('#objectPlates').addClass('error-color')
            }else 
            {
                //Error plates input remove...
                $('#objectPlates').removeClass('error-color')   

                /** - Step [3]
                 *  - Build dataset to be sent to server...
                 */
                var data2Send = 
                {
                    'object_id':objectID,
                    'object_type':objectCategory,
                    'object_available':objectAvailability, 
                    'object_owner':"",'object_plates':objectPlates
                }

                //LOADER..!
                $('.toast-loader').css('display','grid').hide().fadeIn(200);
                animationFunction.animateTruck(true)

                /** - Step [4]
                 *  - AJAX REQUEST...
                 */
                $.ajax({
                    //url: 'http://localhost:8080/addObject',
                    url: 'https://maylob-backend.onrender.com/addObject',
                    type: "post",
                    dataType: 'json',
                    data:data2Send,
                    success : (function (data) 
                    {
                        if (data.message == 0) 
                        {
                            $('#errorToastPrompt').text("⛟ ID YA REGISTRADO.")
                            $('#errorToastPrompt').append("<p>🛈 Por favor ingresa uno diferente.</p>")
                            $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200)
                        }else
                        {
                            $('#okToastPrompt').text("⛟ Equipo registrado exitosamente.")
                            $('.toast-ok').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200)   
                    
                            $("#objectID").val('');
                        }
                    }),
                    
                    error: function(serverResponse) 
                    {   
                        //console.log(serverResponse);
                        $('.pop-error').removeClass('hidden')
                        $('.pop-error').addClass('pop-up')
                        $('.pop-up').fadeIn(500)
                        $('#errorText').text("⛟ ERROR EN EL SERVIDOR.")
                        $('#errorText').append("<p>🛈 Parece que el servidor no puede responder.</p>")
                    },

                    complete: function() 
                    {
                        //LOADER..!
                        $('.toast-loader').fadeOut(200)
                        animationFunction.animateTruck(false)
                    },

                    //async:false
                }) 

            }
        } else 
        {
            //LOADER..!
            $('.toast-loader').css('display','grid').hide().fadeIn(200);
            animationFunction.animateTruck(true)

            /** - Step [3]
            *   - Build dataset to be sent to server...
            */
            var data2Send = 
            {
                'object_id':objectID,
                'object_type':objectCategory,
                'object_available':objectAvailability, 
                'object_owner':"",'object_plates':objectPlates
            }
            /** - Step [4]
             *  - AJAX REQUEST...
             */
            $.ajax({
                //url: 'http://localhost:8080/addObject',
                url: 'https://maylob-backend.onrender.com/addObject',
                type: "post",
                dataType: 'json',
                data:data2Send,
                success : (function (data) 
                {
                    if (data.message == 0) 
                    {
                        $('#errorToastPrompt').text("⛟ ID YA REGISTRADO.")
                        $('#errorToastPrompt').append("<p>🛈 Por favor ingresa uno diferente.</p>")
                        $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200)
                    }else
                    {
                        $('#okToastPrompt').text("⛟ Equipo registrado exitosamente.")
                        $('.toast-ok').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200)   
                
                        $("#objectID").val('');
                    }
                }),
                
                error: function(serverResponse) 
                {   
                    //console.log(serverResponse);
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ ERROR EN EL SERVIDOR.")
                    $('#errorText').append("<p>🛈 Parece que el servidor no puede responder.</p>")
                },
                complete: function() 
                {
                    //LOADER..!
                    $('.toast-loader').fadeOut(200)
                    animationFunction.animateTruck(false)
                },
                //async:false
            }) 
        }

    }
});

/** BACKWARD NAVIGATION */
$('#goBack_btn').click(function()
{
    let lastVisitedView = viewHistory[viewHistory.length-1];

    animationFunction.navigateToView(actualView,lastVisitedView,false,'flex')
    animationFunction.shrinkAnimation('navBar',false)
});

//#endregion [ ADD EQUIPMENT VIEW ]





//#region [ADD MANEUVER VIEW]

//#region  formStep_A

/** BACKWARD NAVIGATION */
$('#back2IV_AMV').click(function()
{
    animationFunction.goBackAnimation('formStep_A','initialView')
    animationFunction.changeViewTitle('bannerText_prompt','¡Bienvenido!.')
});

/** FORWARD NAVIGATION */
$('#go2step2').click(function()
{
    animationFunction.forwardNavigation('formStep_A','formStep_B')
    animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 2.')
});

//#endregion formStep_A





//#region formStep_B

/** BACKWARD NAVIGATION */
$('#back2STP1_STP2').click(function()
{
    getAvailableManeuvers()

    animationFunction.goBackAnimation('formStep_B','formStep_A')
    animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 1.')
});

/** FORWARD NAVIGATION */
$('#go2step3').click(function()
{
    let maneuver_type = $("#manType").val().trim().toUpperCase()

    if(!validateField(maneuver_type))
    {
        $('#go2step4').prop('disabled',true)    
    } else
    {
        maneuver_type === "EXTERNA" ? $('#go2step4').text('GUARDAR') : $('#go2step4').text('SIGUIENTE')
    }

    animationFunction.forwardNavigation('formStep_B','formStep_C')
    animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 3.')
});

//#endregion formStep_B





//#region formStep_C

/** BACKWARD NAVIGATION */
$('#back2STP2_STP3').click(function()
{
    animationFunction.goBackAnimation('formStep_C','formStep_B')
    animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 2.')
});

/** NAVIGATION FORWARD */
$('#go2step4').click(function()
{
    let maneuver_type =  $('#manType').val()
      
    if (maneuver_type === "EXTERNA") 
    {
        saveManeuver(maneuver_type)
        //animationFunction.goBackAnimation('formStep_C','initialView')
    }else
    {
        animationFunction.forwardNavigation('formStep_C','formStep_D')
        animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 4.')

        setTimeout(function() 
        {
            $("#tractoPick").empty() 
            $("#firstElement").empty() 
            $("#secondElement").empty() 
            $("#thirdElement").empty() 
    
            getAvailableObjects('TRACTO','tractoPick');
            getAvailableObjects('CHASSIS','firstElement');
            getAvailableObjects('PLATAFORMA','firstElement');
            
            switch (maneuver_type)
            {
                case 'SENCILLA':
                    $(".dependant").css('display','none')    
    
                    $("#secondElement").prop('disabled',true)  
                    $("#thirdElement").prop('disabled',true)
                break;
            
                default:
    
                    getAvailableObjects('DOLLY','secondElement');
                    getAvailableObjects('CHASSIS','thirdElement');  
                    getAvailableObjects('PLATAFORMA','thirdElement');  
    
                    $(".dependant").css('display','flex')
    
                    $("#thirdElement").prop('disabled',false)  
                    $("#secondElement").prop('disabled',false)  
                break;
            }
            animationFunction.growAnimation('formStep_D')
        }, 300) 
    }
    
});

//#endregion formStep_C





//#region formStep_D

$('#saveManeuver').click(function()
{
    let maneuver_type = $('#manType').val()

    saveManeuver(maneuver_type)
    
    getAvailableManeuvers()
    //animationFunction.goBackAnimation('formStep_D','initialView')
})

/** BACKWARD NAVIGATION */
$('#back2STP4_STP3').click(function()
{
    animationFunction.goBackAnimation('formStep_D','formStep_C')
    animationFunction.changeViewTitle('bannerText_prompt','Nueva maniobra paso 2.')
});

//#endregion formStep_D

//#endregion [ADD MANEUVER VIEW]





//#region [ MONITOR VIEW ]

// Needs to be global to clear automatic executuion instance...!
var automatedSearchInstance
var searchInstance

//#region Timeline

$('#manSearch_btn').click(function()
{
    let maneuverID_input = $('#moniID_input').val().trim().toUpperCase()

    if (!validateField(maneuverID_input)) 
    {
        $('#errorToastPrompt').text("⛟ Debes llenar el campo.")
        $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200)   
    }else
    {
        $.ajax(
        {
            //url: 'http://localhost:8080/man/findManeuver',
            url: 'https://maylob-backend.onrender.com/man/findManeuver',
            type: "get",
            dataType: 'json',
            data:maneuverID_input,
            success : (function (data) 
            {
                if (data.message == '0') 
                {
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ MANIOBRA NO ENCONTRADA")
                    $('#errorText').append("<p>🛈 Revisa el ID ingresado.</p>") 
                }else
                {  
                    animationFunction.forwardNavigation('moniSearch','moniView')
                    animationFunction.changeViewTitle('bannerText_prompt',data.foundManeuver[0].maneuver_id)

                    let foundEvents = data.foundManeuver[0].maneuver_events.length

                    $("#main_timeline").text("")
                    /* for (let index = 0; index < foundEvents/3; index++) 
                    {
                        fillTimeline(data.foundManeuver[0].maneuver_events[index*3],data.foundManeuver[0].maneuver_events[index*3+1],data.foundManeuver[0].maneuver_events[index*3+2])
                    } */

                        for (let index = (foundEvents-1); index > 0; index-=4) 
                        {
                            if (data.foundManeuver[0].maneuver_events[index] === '100%')
                            {
                                fillTimeline(data.foundManeuver[0].maneuver_events[index-3],data.foundManeuver[0].maneuver_events[index-2],data.foundManeuver[0].maneuver_events[index-1],data.foundManeuver[0].maneuver_events[index],true)
                            }else
                            {
                                fillTimeline(data.foundManeuver[0].maneuver_events[index-3],data.foundManeuver[0].maneuver_events[index-2],data.foundManeuver[0].maneuver_events[index-1],data.foundManeuver[0].maneuver_events[index],false)
                            }
                        }

                    searchInstance = data.foundManeuver[0].maneuver_id    
                    automatedSearchInstance = setInterval(function()
                    {
                        getEvents(searchInstance)
                    }, 15000
                    )

                    
                }              
            }),

            error: function(serverResponse) 
            {   
                //console.log(serverResponse);
                $('#errorToastPrompt').text("Error al conectar con el servidor")
                $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200);
            },
            complete: function() 
            {
                $('.toast-loader').fadeOut(500)
                animationFunction.animateTruck(false)
            }, 

            //async:false
        })
    }
})

//#endregion Timeline





//#region pop-ups

// Details pop-up...
$('#openManeuverData_pop').click(function()
{
    $('#maneuverData-pop').css('display','flex').hide().fadeIn(250); 

    //LOADER..!
    $('.toast-loader').css('display','grid').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    /** - Step [1]  
    *   - Search maneuver in DB by AJAX request...
    */

    let maneuverID_input = $('#moniID_input').val().trim().toUpperCase()

    $.ajax({
        //url: 'http://localhost:8080/man/findManeuver',
        url: 'https://maylob-backend.onrender.com/man/findManeuver',
        type: "get",
        dataType: 'json',
        data:maneuverID_input,
        success : (function (data) 
        {

            if (data.message == '0') 
            {
               $('.pop-error').removeClass('hidden')
               $('.pop-error').addClass('pop-up')
               $('.pop-up').fadeIn(500)
               $('#errorText').text("No se encontró la maniobra")
               $('#errorText').append("<p>Revisa el ID ingresado.</p>") 

            }else
            {  
                let containersLength = data.foundManeuver[0].maneuver_containers.length

                for (let index = 0; index < containersLength; index++) 
                {
                    switch (index) 
                    {
                        case 0:
                            validateField(data.foundManeuver[0].maneuver_containers[index])?
                            (
                            $('#container_A_ID').text(data.foundManeuver[0].maneuver_containers[index]),      
                            $('#container_A_size').text(data.foundManeuver[0].maneuver_containers[index+1])      
                            ):
                            (
                            $('#container_A_ID').text("Sin contenedor"),      
                            $('#container_A_size').text("-")        
                            )
                        break;
                        
                        case 2:
                            validateField(data.foundManeuver[0].maneuver_containers[index])?
                            (
                            $('#container_B_ID').text(data.foundManeuver[0].maneuver_containers[index]),      
                            $('#container_B_size').text(data.foundManeuver[0].maneuver_containers[index+1])      
                            ):
                            (
                            $('#container_B_ID').text("Sin contenedor"),      
                            $('#container_B_size').text("-")        
                            )
                        break;

                        case 4:
                            validateField(data.foundManeuver[0].maneuver_containers[index])?
                            (
                            $('#container_C_ID').text(data.foundManeuver[0].maneuver_containers[index]),      
                            $('#container_C_size').text(data.foundManeuver[0].maneuver_containers[index+1])      
                            ):
                            (
                            $('#container_C_ID').text("Sin contenedor"),      
                            $('#container_C_size').text("-")        
                            )
                        break;

                        case 6:
                            validateField(data.foundManeuver[0].maneuver_containers[index])?
                            (
                            $('#container_D_ID').text(data.foundManeuver[0].maneuver_containers[index]),      
                            $('#container_D_size').text(data.foundManeuver[0].maneuver_containers[index+1])      
                            ):
                            (
                            $('#container_D_ID').text("Sin contenedor"),      
                            $('#container_D_size').text("-")        
                            )    
                        break;
                    }
                }

                $('#maneuverID_prompt').text(data.foundManeuver[0].maneuver_id)
                $('#maneuverDate_prompt').text(data.foundManeuver[0].maneuver_planned_date)
                $('#maneuverClient_prompt').text(data.foundManeuver[0].maneuver_customer)
                $('#maneuverSize_prompt').text(data.foundManeuver[0].maneuver_size)
                $('#maneuverType_prompt').text(data.foundManeuver[0].maneuver_type)
                $('#maneuverOrigin_prompt').text(data.foundManeuver[0].maneuver_origin)
                $('#maneuverDestination_prompt').text(data.foundManeuver[0].maneuver_destination)
                $('#maneuverOperator_prompt').text(data.foundManeuver[0].maneuver_operator)
                
            }              
        }),

        error: function(serverResponse) 
        {   
            //console.log(serverResponse);
            $('#errorToastPrompt').text("Error al conectar con el servidor")
            $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200);
        },
        complete: function() 
        {
            $('.toast-loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 

        async:false
     })
})


$('#closeManeuverData_pop').click(function()
{
    $('#maneuverData-pop').fadeOut(250)
})


// Tracking pop-up...
$('#openGPS_pop').click(function()
{
    $('#gps-pop').css('display','flex').hide().fadeIn(250); 
    
    $('#trackingMap').empty()
    getGPS(searchInstance)
    
})

$('#closeGPS-pop').click(function()
{
    $('#gps-pop').fadeOut(250)
})


//#endregion pop-ups


/** BACKWARD NAVIGATION */
$('#back2IV_MS').click(function()
{

    clearInterval(automatedSearchInstance)


    animationFunction.goBackAnimation('moniSearch','initialView')
    animationFunction.changeViewTitle('bannerText_prompt','¡Bienvenido!')
})

/** BACKWARD NAVIGATION */
$('#back2MS_MONI').click(function()
{

    clearInterval(automatedSearchInstance)

    animationFunction.goBackAnimation('moniView','moniSearch')
    animationFunction.changeViewTitle('bannerText_prompt','Monitor')
})

//#endregion [ MONITOR VIEW ]





//#region [ MANEUVERS ID VIEW ]

$('#back2IV_MW').click(function()
{
    animationFunction.goBackAnimation('maneuversView','initialView')
    animationFunction.changeViewTitle('bannerText_prompt','¡Bienvenido!')
});

var gpsmaneuver_id = ""
var newGPSlink     = ""

$('#maneuversList').on('click','.update', (e)=>
{
    $('#updateGPS_pop').css('display','flex').hide().fadeIn(250); 

    gpsmaneuver_id = $(e.target).closest('.maneuverElement')
    .find('.maneuverElement_data')
    .find('.strong').text()
})



$('#maneuversList').on('click','.delete', (e)=>
{
    console.log($(e.target).closest('.cardWidget')
    .find('.cardWidget_header')
    .find('.cardWidgetHeader_text')
    .find('.widget_ID').text());

})

$('#closeUpdateLINK').click(function()
{
    $('#updateGPS_pop').fadeOut(250)
})

$('#updateGPSbtn').click(function()
{
    newGPSlink = $('#updateGPSinput').val().trim()

    console.log(newGPSlink,gpsmaneuver_id);

    let data2send = 
    {
        'maneuver_id':gpsmaneuver_id,
        'maneuver_tracking_link':newGPSlink
    }

    updateGPS(data2send)
})

//#endregion [ MANEUVERS ID VIEW ]




/**
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * +                                                                                               +
 * + [⚑] AUXILIARY FUCTIONS...                                                                     +
 * +                                                                                               +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 */ 



function getGPS(maneuver_id)
{
    //LOADER...!
    $('.toast-loader').css('display','grid').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    $.ajax({
        //url: 'http://localhost:8080/man/getGPS',
        url: 'https://maylob-backend.onrender.com/man/getGPS',
        type: 'get',
        contentType: 'application/json',
        data: maneuver_id,
        success : (function (data) 
        {
            console.log(data.trackingLink);

            if (data.trackingLink!='POR DEFINIR') 
            {
                showGPS(data.trackingLink)        
            }else
            {
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ No hay TRACKING disponible.")
                $('#errorText').append("<p>🛈 Estamos actualizando el tracking.</p>")
            }
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ LINK NO ACTUALIZADO")
            $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")
        },

        complete: function() 
        {
            $('.toast-loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
    })     

}





function updateGPS(data2send)
{
    //LOADER...!
    $('.toast-loader').css('display','grid').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    $.ajax({
        //url: 'http://localhost:8080/man/updateManeuverGPS',
        url: 'https://maylob-backend.onrender.com/man/updateManeuverGPS',
        type: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(data2send),
        success : (function (data) 
        {
            console.log(data);

            $('.pop-ok').removeClass('hidden')
            $('.pop-ok').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#okText').text("⛟ Link actualizado")
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ LINK NO ACTUALIZADO")
            $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")
        },

        complete: function() 
        {
            $('.toast-loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
    })     

    $('#updateGPS_pop').fadeOut(250)
    $('#updateGPSinput').val('')
    console.log($('#updateGPSinput').val());
}





function saveManeuver(maneuver_type)
{
    /** - Step [1]
     *  - Gather and validate commom form data...
     */

    let incompleteFields = []

    let maneuver_origin = $("#manOrig_select").val().trim().toUpperCase() 
    if(maneuver_origin === "OTRA") 
    {
        maneuver_origin = $("#manOrig_input").val().trim().toUpperCase()
        
        validateField(maneuver_origin) ? 
        maneuver_origin = maneuver_origin
        :
        maneuver_origin = "POR DEFINIR"
    }

    let maneuver_destination = $("#manDest_select").val().trim().toUpperCase() 
    if(maneuver_destination === "OTRA") 
    {
        maneuver_destination = $("#manDest_input").val().trim().toUpperCase()
        
        validateField(maneuver_destination) ? 
        maneuver_destination = maneuver_destination
        :
        maneuver_destination = "POR DEFINIR"
    }

    let maneuver_customer = $("#manUser").val().trim().toUpperCase()
    if(!validateField(maneuver_customer)) incompleteFields.push('CLIENTE')

    let maneuver_date = $("#manDate").val()    
    if(!validateField(maneuver_date)) incompleteFields.push('FECHA')

    let maneuver_operator = $("#manOP").val().trim().toUpperCase() 
    validateField(maneuver_operator) ? 
    maneuver_operator = maneuver_operator
    :
    maneuver_operator = "POR DEFINIR"

    let maneuver_tracking_link = $("#manGPS").val().trim() 
    validateField(maneuver_tracking_link) ? 
    maneuver_tracking_link = maneuver_tracking_link
    :
    maneuver_tracking_link = "POR DEFINIR"

    let container_ID_1      = $("#contID_1").val().trim().toUpperCase()
    let container_ID_2      = $("#contID_2").val().trim().toUpperCase()
    let container_ID_3      = $("#contID_3").val().trim().toUpperCase()
    let container_ID_4      = $("#contID_4").val().trim().toUpperCase()
    let container_size_1    = $("#contSize_1").val().trim().toUpperCase()
    let container_size_2    = $("#contSize_2").val().trim().toUpperCase()
    let container_size_3    = $("#contSize_3").val().trim().toUpperCase()
    let container_size_4    = $("#contSize_4").val().trim().toUpperCase()

    let maneuver_containers = 
    [
        container_ID_1,
        container_size_1,
        container_ID_2,
        container_size_2,
        container_ID_3,
        container_size_3,
        container_ID_4,
        container_size_4,
    ]
    
    let equipmentRoster = []

    /** Maneuver USER
     *  [A] = EXTERNAL... 
     *  [B] = PROPIETARY (FULL & SINGLE)...
     */

    // [A]
    if (maneuver_type === "EXTERNA")
    {
        //LOADER...!
        $('.toast-loader').css('display','grid').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        /** - Step [A][1]
         *  - Validate required fields...
         */
        if (incompleteFields.length > 0)
        {
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ No se pudo guardar la maniobra")

            for (let index = 0; index < incompleteFields.length; index++) 
            {
                $('#errorText').append("<p>🛈 Debes llenar el campo de "+incompleteFields[index]+"</p>")
            }

            $('.toast-loader').fadeOut(200)
            animationFunction.animateTruck(false)
        }else
        {
            /** - Step [A][2]
            *  - Prepare data to be sent...
            */        
            equipmentRoster = ["N/A"]
            let data2Send = 
            {
                'maneuver_type':maneuver_type,
                'maneuver_origin':maneuver_origin,
                'maneuver_destination':maneuver_destination,
                'maneuver_customer':maneuver_customer,
                'maneuver_planned_date':maneuver_date,
                'maneuver_equipment':equipmentRoster,
                'maneuver_containers':maneuver_containers,
                'maneuver_operator':maneuver_operator,
                'maneuver_tracking_link':maneuver_tracking_link
            }

            $.ajax({
                //url: 'http://localhost:8080/man/addManeuver',
                url: 'https://maylob-backend.onrender.com/man/addManeuver',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data2Send),
                success : (function (data) 
                {
                    $('.pop-ok').removeClass('hidden')
                    $('.pop-ok').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#okText').text("⛟ Maniobra guardada")

                    animationFunction.goBackAnimation('formStep_C','initialView')
                }),
    
                error: function(XMLHttpRequest, textStatus, errorThrown) 
                {  
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ No se pudo guardar la maniobra")
                    $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")
                },
    
                complete: function() 
                {
                    $('.toast-loader').fadeOut(200)
                    animationFunction.animateTruck(false)
                },
            
                //async:false
            }) 
            
        }

    }else // [B]
    {
        //LOADER...!
        $('.toast-loader').css('display','grid').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        let tractoPicked            = $("#tractoPick").val().trim()
        let firstElementPicked      = $("#firstElement").val().trim()
        let secondElementPicked     =''
        let thirdElementPicked      =''

        equipmentRoster = [tractoPicked,firstElementPicked]

        if(maneuver_type === 'FULL')
        {
            secondElementPicked = $("#secondElement").val().trim()
            thirdElementPicked  = $("#thirdElement").val().trim()

            equipmentRoster.push(secondElementPicked)
            equipmentRoster.push(thirdElementPicked)
        }

        let data2Send = 
        {
            'maneuver_type':maneuver_type,
            'maneuver_origin':maneuver_origin,
            'maneuver_destination':maneuver_destination,
            'maneuver_customer':maneuver_customer,
            'maneuver_planned_date':maneuver_date,
            'maneuver_equipment':equipmentRoster,
            'maneuver_containers':maneuver_containers,
            'maneuver_operator':maneuver_operator,
            'maneuver_tracking_link':maneuver_tracking_link
        }

        $.ajax({
            //url: 'http://localhost:8080/man/addManeuver',
            url: 'https://maylob-backend.onrender.com/man/addManeuver',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data2Send),
            success : (function (data) 
            {
                $('.pop-ok').removeClass('hidden')
                $('.pop-ok').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#okText').text("⛟ Maniobra guardada")

                animationFunction.goBackAnimation('formStep_D','initialView')
            }),

            error: function(XMLHttpRequest, textStatus, errorThrown) 
            {  
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ No se pudo guardar la maniobra")
                $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")

            },

            complete: function() 
            {
                $('.toast-loader').fadeOut(200)
                animationFunction.animateTruck(false)
            },
        
            //async:false
        }) 
    }
}





function getEvents(maneuverID_input)
{
    //LOADER...!
    $('.toast-loader').css('display','grid').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    $.ajax({
        //url: 'http://localhost:8080/man/findManeuver',
        url: 'https://maylob-backend.onrender.com/man/findManeuver',
        type: "get",
        dataType: 'json',
        data:maneuverID_input,
        success : (function (data) 
        {
            if (data.message != '0') 
            {
                let foundEvents = data.foundManeuver[0].maneuver_events.length

                $("#main_timeline").text("")

                for (let index = (foundEvents-1); index > 0; index-=4) 
                {
                    if (data.foundManeuver[0].maneuver_events[index] === "100%")
                    {
                        fillTimeline(data.foundManeuver[0].maneuver_events[index-3],data.foundManeuver[0].maneuver_events[index-2],data.foundManeuver[0].maneuver_events[index-1],data.foundManeuver[0].maneuver_events[index],true)
                    }else
                    {
                        fillTimeline(data.foundManeuver[0].maneuver_events[index-3],data.foundManeuver[0].maneuver_events[index-2],data.foundManeuver[0].maneuver_events[index-1],data.foundManeuver[0].maneuver_events[index],false)
                    }
                }
            }              
        }),

        error: function(serverResponse) 
        {   
            //console.log(serverResponse);
            $('#errorToastPrompt').text("⛟ Error al conectar con el servidor")
            $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200);
        },

        complete: function() 
        {
            $('.toast-loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 

        //async:false
    })
}





function getAllManeuversID()
{
    //LOADER...!
    $('.toast-loader').css('display','grid').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    $.ajax({
        //url: 'http://localhost:8080/man/getAllManeuvers',
        url: 'https://maylob-backend.onrender.com/man/getAllManeuvers',
        type: "get",
        dataType: 'json',
        success : (function (data) 
        {

            if (data.message == '0') 
            {
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ No se encontraron maniobras.")
            }else
            {  
                for (let index = 0; index < data.objectsFound.length; index++) 
                {
                   fillIDDashboard(data.objectsFound[index].maneuver_id,data.objectsFound[index].maneuver_current_status,data.objectsFound[index].maneuver_current_location,data.objectsFound[index].maneuver_operator)
                    
                    /* var foundEvents = data.foundManeuver[0].maneuver_events.length
    
                    $("#main_timeline").text("")
                    for (let index = 0; index < foundEvents/3; index++) 
                    {
                        fillTimeline(data.foundManeuver[0].maneuver_events[index*3],data.foundManeuver[0].maneuver_events[index*3+1],data.foundManeuver[0].maneuver_events[index*3+2])
                    } */
                }
            }              
        }),

        error: function(serverResponse) 
        {   
            //console.log(serverResponse);
            $('#errorToastPrompt').text("Error al conectar con el servidor")
            $('.toast-error').css('display','grid').hide().fadeIn(200).delay(2000).fadeOut(200);
        },
        complete: function() 
        {
            $('.toast-loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 

        //async:false
    })
}



/** Execute this to fill id dashboard elements...
 * 
 */
function fillIDDashboard(maneuverID,lastStatus,lastLocation,operatorName)
{
/*     
    $("#maneuversList").append(
        "<div class='maneuverElement flexCentered'>"+
        "<div class='maneuverElement_data'>"+
        "<p class='strong'>"+maneuverID+"</p>"+
        "<p>"+lastStatus+"</p>"+
        "<p>"+lastLocation+"</p>"+
        "</div>"+

        "<div class='maneuverElement_btns'>"+
        "<button class='linkBtn delete flexCentered '>"+
        "<img src='img/error.svg' alt=''>"+
        "</button>"+

        "<button class='linkBtn update flexCentered '>"+
        "<img src='img/editar.svg' alt='flecha'>"+
        "</button>"+
        "</div>"+
        "</div>"
    ) */

    $("#maneuversList").append(
        "<div class='cardWidget'>"+
        "<div class='cardWidget_header'>"+
        "    <div class='cardWidgetHeader_logo flexCentered'>"+
        "        <img src='img/tracto.svg' alt='truck image'>"+
        "    </div>"+
        "    <div class='cardWidgetHeader_text'>"+
        "        <div class='cardWidget_row'>"+
        "            <p class='strong-orange'>MANIOBRA</p>"+
        "            <p class='light-white widget_ID'>"+maneuverID+"</p>"+
        "        </div>"+
    
        "        <div class='cardWidget_row'>"+
        "            <p class='strong-orange'>OPERADOR</p>"+
        "            <p class='light-white'>"+operatorName+"</p>"+
        "        </div>"+
        "    </div>"+
        "</div>"+
    
        "<div class='cardWidget_data'>"+
        "    <div class='cardWidget_row'>"+
        "        <p class='strong-orange'>ÚLTIMA ACTUALIZACIÓN</p>"+
        "        <p class='light-white'>"+lastStatus+"</p>"+
        "    </div>"+
    
        "    <div class='cardWidget_row'>"+
        "        <p class='strong-orange'>ÚLTIMA UBICACIÓN</p>"+
        "        <p class='light-white'>"+lastLocation+"</p>"+
        "    </div>"+
        "</div>"+
        
        "<div class='cardWidget_buttons'>"+
        "    <button class='cardWidget_btn'>"+
        "        <img class='cardWidget_btnImg delete' src='img/delete_red.svg' alt='error image'>"+
        "    </button>"+
        
        "    <button class='cardWidget_btn'>"+
        "        <img class='cardWidget_btnImg' src='img/editar.svg' alt='edit image'>"+
        "    </button>"+
    
        "    <button class='cardWidget_btn'>"+
        "        <img class='cardWidget_btnImg' src='img/location_orange.svg' alt='location image'>"+
        "    </button>"+
    
        "    <button class='cardWidget_btn'>"+
        "        <img class='cardWidget_btnImg' src='img/see_orange.svg' alt='location image'>"+
        "    </button>"+
        "</div>"+
        "</div>"
    )

}



/** Execute this to fill tracking embeded...
 * 
 */
function showGPS(maneuverGPSlink)
{
    
    $("#trackingMap").append(
        
        "<embed src='"+maneuverGPSlink+"' class='top view_100'>"
    )
}






/** Execute this to fill timeline elements...
 * 
 */
function fillTimeline(eventTime,eventLocation,eventStatus,eventPercentage,completed)
{
    
    if (!completed) 
    {
        $("#main_timeline").append(
            "<div class='eventPoint flexCentered '></div>"+
            "<div class='eventPath'></div>"+
            "<div class='eventContainer flexCentered'>"+
            "<div class='eventCard-data'>"+
            "<div class='flexCentered eventCard-time'>"+
            "<p>"+eventTime+"</p>"+
            "</div>"+
            "<div class='flexCentered eventCard-steps '>"+
            "<img src='img/truck.svg' alt='truck'>"+
            "<p class='eventCard-step-percentage'>"+eventPercentage+"</p>"+
            "</div>           "+
            "<div class='flexCentered eventCard-dataContainer'>"+
            "<div class='eventCard-eventLogo flexCentered'>"+
            "<img src='img/ubicacion.svg' alt='truck'>"+
            "</div>"+
            "<div class='eventCard-eventInfo'>"+
            eventLocation+
            "</div>"+
            "</div>"+
            "<div class='flexCentered eventCard-dataContainer'>"+
            "<div class='eventCard-eventLogo flexCentered'>"+
            "<img src='img/inventory_img.svg' alt='truck'>"+
            "</div>"+
            "<div class=' eventCard-eventInfo'>"+
            eventStatus+
            "</div>"+
            "</div>"+
            "</div>"+
            "<div class='eventCard-color orange-bg'></div>"+
            "</div>"
        )
    }else
    {
        $("#main_timeline").append(
            "<div class='eventContainer flexCentered'>"+
            "<div class='eventCard-data'>"+
            "<div class='flexCentered eventCard-time'>"+
            "<p class='green-text'>"+eventTime+"</p>"+
            "</div>"+
            "<div class='flexCentered eventCard-steps '>"+
            "<img src='img/ok_logo.svg' alt='truck'>"+
            "<p class='eventCard-step-percentage green-text'>"+eventPercentage+"</p>"+
            "</div>           "+
            "<div class='flexCentered eventCard-dataContainer'>"+
            "<div class='eventCard-eventLogo flexCentered'>"+
            "<img src='img/ubicacion.svg' alt='truck'>"+
            "</div>"+
            "<div class='eventCard-eventInfo green-text'>"+
            eventLocation+
            "</div>"+
            "</div>"+
            "<div class='flexCentered eventCard-dataContainer'>"+
            "<div class='eventCard-eventLogo flexCentered'>"+
            "<img src='img/inventory_img.svg' alt='truck'>"+
            "</div>"+
            "<div class=' eventCard-eventInfo green-text'>"+
            eventStatus+
            "</div>"+
            "</div>"+
            "</div>"+
            "<div class='eventCard-color green-bg'></div>"+
            "</div>"
        )
    }


}


/** - Execute this everytime form formStep_A 
 *    needs to be loaded to search for maneuvers...
 */
function getAvailableManeuvers()
{
   //LOADER...!
   $('.toast-loader').css('display','grid').hide().fadeIn(200);
   animationFunction.animateTruck(true)

   $('#manType').empty()

    $.ajax({
        //url: 'http://localhost:8080/man/getManeuvers',
        url: 'https://maylob-backend.onrender.com/man/getManeuvers',
        type: "get",
        dataType: 'json',
        success : (function (data) 
        {
            /** - Step [1]
             *  - Handle server response...
             */
            if (data.message === '0') 
            {
                /* $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ SIN DISPONIBILIDAD.")
                $('#errorText').append("<p>🛈 Parece que no hay maniobras disponibles.</p>")
                $('#saveManeuver').prop('disabled',true)
                $('#saveManeuver').removeClass('btn')
                $('#saveManeuver').addClass('disabledBtn')  */

            }else
            {   
                $('#saveManeuver').prop('disabled',false)
                $('#saveManeuver').removeClass('disabledBtn')
                $('#saveManeuver').addClass('btn') 
                $('#manType').empty()

                for (let index = 0; index < data.availableManeuvers.length; index++) 
                {
                    fillSelect('manType',data.availableManeuvers[index])    
                }

                return true
            }             
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ ERROR EN EL SERVIDOR.")
            $('#errorText').append("<p>🛈 Parece que el servidor no puede responder.</p>")
            $('#saveManeuver').prop('disabled',true)
            $('#saveManeuver').removeClass('btn')
            $('#saveManeuver').addClass('disabledBtn') 

            return false
        },
        
        complete: function() 
        {
            $('.toast-loader').fadeOut(500)
            animationFunction.animateTruck(false)
        },
        
        //async:false
    })
}


/** Execute this everytime form formStep_A is loaded...
 * @param {*} objectType 
 * @param {*} selectID 
 */
function getAvailableObjects(objectType, selectID)
{
    /** - STEP [1]
    *   - Look for the object(s) by the value...
    */
    $.ajax({
        //url: 'http://localhost:8080/getAvailableObjects',
        url: 'https://maylob-backend.onrender.com/getAvailableObjects',
        type: "get",
        dataType: 'json',
        data: objectType,
        success : (function (data) 
        {
            /** - Step [2]
             *  - Handle data received by SERVER...
             */            
            if (data.message === '0') 
            {
                $('.pop-error').addClass('pop-up')
                $('.pop-error').removeClass('hidden')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("No hay "+objectType+" disponible(s).")
            }else
            {  
                for (let index = 0; index < data.objectsFound.length; index++) 
                {
                    fillSelect(selectID,data.objectsFound[index].object_id)    
                } 
            }             
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('#errorToastPrompt').text('Error en la solicitud...')
            $('.toast-error').css('display','grid').hide().fadeIn(2000).fadeOut(2000);  
        },
        
        complete: function() 
        {
            $('.toast-loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
        
        //async:false
    })

}


/** Fill any select dinamically
 * 
 * @param {*} selectID 
 * @param {*} value 
 * @note Make sure to empty the control before: $('#id').empty()
 */
function fillSelect(selectID, value)
{
    $("#"+selectID+"").append(
        "<option value='"+value+"'>"+value+"</option>"
    )
}


/** Use to validate that no value is empty... 
 * @param {*} fieldValue 
 * @returns true if valid
 */
function validateField(fieldValue)
{
    //console.log(fieldValue);
    if (fieldValue === undefined || fieldValue === "" || fieldValue === null) 
    {
        return false
    }else
    {
        return true
    }          
}


/** Use this to validate FORM SECTIONS...
 * @description
 * Receive a DATA ARRAY and validates if all values are complete...
 * @param {Array} formValues 
 */
function validateFormSection(formValues)
{
    let filledFields    = 0
    let tempChecker
    
    for (let index = 0; index < formValues.length; index++) 
    {
        tempChecker = validateField(formValues[index])
        tempChecker == true ? filledFields++ : filledFields = filledFields                
    } 
    
    if (filledFields === formValues.length) 
    {
        return true
    }else
    {
        return false
    }
}

/**POP-UP */
$('#closeError').click(function()
{
    $('.pop-up').fadeOut(500);
    $('.pop-error').removeClass('pop-up')
    $('.pop-error').addClass('hidden')
})

/**POP-UP */
$('#closeOK').click(function()
{   
    $('.pop-up').fadeOut(500);
    $('.pop-ok').removeClass('pop-up')
    $('.pop-ok').addClass('hidden')

    getAvailableManeuvers()
})


/** Dynamic content */
$('#manOrig_select').on('change',function()
{
    if (this.value ==="OTRA") 
    {
        $('#manOrig_input').css('display','grid').hide().fadeIn(200);
    }else
    {
        $('#manOrig_input').fadeOut(200)
    }
})

/** Dynamic content */
$('#manDest_select').on('change',function()
{
    if (this.value ==="OTRA") 
    {
        $('#manDest_input').css('display','grid').hide().fadeIn(200);
    }else
    {
        $('#manDest_input').fadeOut(200)
    }
})
