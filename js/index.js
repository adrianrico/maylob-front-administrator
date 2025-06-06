import * as animationFunction from '/js/gsap/indexAnimations.js';

// Landing page set default...
var actualPage = ''

// Used for local testing...
var API_URL = 'http://127.0.0.1:8080'
//var API_URL = 'https://maylob-backend.onrender.com'

//#region [ INITIAL VIEW ]

$('#go2addManeuvers').click(function()
{
    preloadPageControls()
    actualPage = animationFunction.navigateToView('homePage','addManeuverPage',false,'flex')
});

$('#go2maneuversID').click(function()
{
    actualPage = animationFunction.navigateToView('homePage','maneuversPage',false,'flex')

    $('#maneuvuers_scrollableContainer').empty()
    getAllManeuversID()
});

//#endregion [ INITIAL VIEW ]





//#region [ NAV BAR ]

//Backward navigation...
$('#goBack_btn').click(function()
{
    switch (actualPage) 
    {
        case 'maneuversPage':
           actualPage = animationFunction.navigateToView('maneuversPage','homePage',false,'flex')
        break;

        case 'addManeuverPage':
           actualPage = animationFunction.navigateToView('addManeuverPage','homePage',false,'flex') 
        break;
    
        default: break;
    }
});

$('#save_btn').click(function()
{
    switch (actualPage) 
    {
        case 'maneuversPage':

        break;

        case 'addManeuverPage':
           saveNewManeuver() 
        break;
    
        default: break;
    }
});

$('#filter_btn').click(function()
{
    switch (actualPage) 
    {
        case 'maneuversPage':
            animationFunction.growAnimation('filter_container',false,'flex')
        break;
    
        default: break;
    }
});

//#endregion [ NAV BAR ]





//#region [ADD MANEUVER PAGE ]

    // EXTRA LOCATION dynamic enable...
    $('.addManeuver_formFields').on('change','#descarga_select', (e)=> 
    {
        if ($('#descarga_select').val() === 'OTRO') 
        {
            $('#descargaExtra_nombre').prop('disabled',false)
            $('#descargaExtra_ubicacion').prop('disabled',false)
        }else
        {
            $('#descargaExtra_nombre').prop('disabled',true)
            $('#descargaExtra_nombre').val('')
        
            $('#descargaExtra_ubicacion').prop('disabled',true)
            $('#descargaExtra_ubicacion').val('')
        }
    })

    // EQUIPMENT AND OPERATORS Dinamycally fill by a search parameter...
    $('.addManeuver_formFields').on('change','#transportista_select', (e)=> 
    {
        //LOADER...!
        $('#truck_loader').css('display','flex').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        //Get value from SELECT control change...
        let transporter_name = $(e.target).closest('.addManeuver_formContainer')
        .find('.addManeuver_formContainer_topRow')
        .find('.addManeuver_formFields')
        .find('#transportista_select').val();

        if (validateField(transporter_name)) 
        {
            let data2Send = {'transporter_name':transporter_name}

            $.ajax({
                url: API_URL+'/readTransporters',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data2Send),
                success : (function (data) 
                {
                    if (data.message == '0') 
                    {
                        $('.pop-error').removeClass('hidden')
                        $('.pop-error').addClass('pop-up')
                        $('.pop-up').fadeIn(500)
                        $('#errorText').text("⛟ No hay transportistas registrados.")
    
                    }else
                    {  
                        // ECO SELECT CONTROL fill...
                        $('#eco_select').empty()
                        $('#eco_select').append("<option value=''>SELECCIONA</option>")
                        for (let index = 0; index < data.transportersFound[0].transporter_equipment.length; index++) 
                        {
                            $('#eco_select').append(
                                "<option value='"+data.transportersFound[0].transporter_equipment[index]+"'>"+data.transportersFound[0].transporter_equipment[index]+"</option>"
                            )
                        } 

                        // OPERATOR SELECT CONTROL fill...
                        $('#operador_select').empty()
                        $('#operador_select').append("<option value=''>SELECCIONA</option>")
                        for (let index = 0; index < data.transportersFound[0].transporter_operators.length; index++) 
                        {
                            $('#operador_select').append(
                                "<option value='"+data.transportersFound[0].transporter_operators[index]+"'>"+data.transportersFound[0].transporter_operators[index]+"</option>"
                            )
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
                    $('#truck_loader').fadeOut(500)
                    animationFunction.animateTruck(false)
                }, 
    
                //async:false
            })
        }else
        {
            $('#eco_select').empty()
            $('#operador_select').empty()
            
            // LOADER...
            $('#truck_loader').fadeOut(500)
            animationFunction.animateTruck(false)   
        }

    })

    // CONTAINERS WEIGHT Dinamycally color change...
    $('.addManeuver_formFields').on('input','.containers_weight', (e)=> 
    {
        let cont_1_size   = parseInt($('#con1Size_select').val(),10)
        let cont_1_weight = parseInt($('#con1weight_input').val(),10)
        let cont_2_size   = parseInt($('#con2Size_select').val(),10)
        let cont_2_weight = parseInt($('#con2weight_input').val(),10)
        let cont_3_size   = parseInt($('#con3Size_select').val(),10)
        let cont_3_weight = parseInt($('#con3weight_input').val(),10)
        let cont_4_size   = parseInt($('#con4Size_select').val(),10)
        let cont_4_weight = parseInt($('#con4weight_input').val(),10)

        checkContainers('con1weight_input',cont_1_size,cont_1_weight)
        checkContainers('con2weight_input',cont_2_size,cont_2_weight)
        checkContainers('con3weight_input',cont_3_size,cont_3_weight)
        checkContainers('con4weight_input',cont_4_size,cont_4_weight)
    })

    // CONTAINERS dynamic enable...
    $('.addManeuver_formFields').on('change','#modalidad_select', (e)=> 
    {
        let selectedMode = $('#modalidad_select').val()

        switch (selectedMode) 
        {
            case 'SENCILLO':
                $('#con1ID_input').prop('disabled',false)
                $('#con1Size_select').prop('disabled',false)
                $('#con1Content_input').prop('disabled',false)
                $('#con1weight_input').prop('disabled',false)
                $('#con1type_input').prop('disabled',false)

                $('#con2ID_input').prop('disabled',true)
                $('#con2Size_select').prop('disabled',true)
                $('#con2Content_input').prop('disabled',true)
                $('#con2weight_input').prop('disabled',true)
                $('#con2type_input').prop('disabled',true)

                $('#con3ID_input').prop('disabled',true)
                $('#con3Size_select').prop('disabled',true)
                $('#con3Content_input').prop('disabled',true)
                $('#con3weight_input').prop('disabled',true)
                $('#con3type_input').prop('disabled',true)

                $('#con4ID_input').prop('disabled',true)
                $('#con4Size_select').prop('disabled',true)
                $('#con4Content_input').prop('disabled',true)
                $('#con4weight_input').prop('disabled',true)
                $('#con4type_input').prop('disabled',true)
            break;
            
            case 'FULL':
                $('#con1ID_input').prop('disabled',false)
                $('#con1Size_select').prop('disabled',false)
                $('#con1Content_input').prop('disabled',false)
                $('#con1weight_input').prop('disabled',false)
                $('#con1type_input').prop('disabled',false)

                $('#con2ID_input').prop('disabled',false)
                $('#con2Size_select').prop('disabled',false)
                $('#con2Content_input').prop('disabled',false)
                $('#con2weight_input').prop('disabled',false)
                $('#con2type_input').prop('disabled',false)

                $('#con3ID_input').prop('disabled',false)
                $('#con3Size_select').prop('disabled',false)
                $('#con3Content_input').prop('disabled',false)
                $('#con3weight_input').prop('disabled',false)
                $('#con3type_input').prop('disabled',false)

                $('#con4ID_input').prop('disabled',false)
                $('#con4Size_select').prop('disabled',false)
                $('#con4Content_input').prop('disabled',false)
                $('#con4weight_input').prop('disabled',false)
                $('#con4type_input').prop('disabled',false)
            break;
        
            default:
                $('#con1ID_input').prop('disabled',true)
                $('#con1Size_select').prop('disabled',true)
                $('#con1Content_input').prop('disabled',true)
                $('#con1weight_input').prop('disabled',true)
                $('#con1type_input').prop('disabled',true)

                $('#con2ID_input').prop('disabled',true)
                $('#con2Size_select').prop('disabled',true)
                $('#con2Content_input').prop('disabled',true)
                $('#con2weight_input').prop('disabled',true)
                $('#con2type_input').prop('disabled',true)

                $('#con3ID_input').prop('disabled',true)
                $('#con3Size_select').prop('disabled',true)
                $('#con3Content_input').prop('disabled',true)
                $('#con3weight_input').prop('disabled',true)
                $('#con3type_input').prop('disabled',true)

                $('#con4ID_input').prop('disabled',true)
                $('#con4Size_select').prop('disabled',true)
                $('#con4Content_input').prop('disabled',true)
                $('#con4weight_input').prop('disabled',true)
                $('#con4type_input').prop('disabled',true)
            break;
        }

     /*    if ($('#descarga_select').val() === 'OTRO') 
        {
            $('#descargaExtra_nombre').prop('disabled',false)
            $('#descargaExtra_ubicacion').prop('disabled',false)
        }else
        {
            $('#descargaExtra_nombre').prop('disabled',true)
            $('#descargaExtra_nombre').val('')
        
            $('#descargaExtra_ubicacion').prop('disabled',true)
            $('#descargaExtra_ubicacion').val('')
        } */
    })

    function preloadPageControls()
    {
        //LOADER...!
        $('#truck_loader').css('display','flex').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        $('#con1ID_input').prop('disabled',true)
        $('#con1Size_select').prop('disabled',true)
        $('#con1Content_input').prop('disabled',true)
        $('#con1weight_input').prop('disabled',true)
        $('#con1type_input').prop('disabled',true)

        $('#con2ID_input').prop('disabled',true)
        $('#con2Size_select').prop('disabled',true)
        $('#con2Content_input').prop('disabled',true)
        $('#con2weight_input').prop('disabled',true)
        $('#con2type_input').prop('disabled',true)

        $('#con3ID_input').prop('disabled',true)
        $('#con3Size_select').prop('disabled',true)
        $('#con3Content_input').prop('disabled',true)
        $('#con3weight_input').prop('disabled',true)
        $('#con3type_input').prop('disabled',true)

        $('#con4ID_input').prop('disabled',true)
        $('#con4Size_select').prop('disabled',true)
        $('#con4Content_input').prop('disabled',true)
        $('#con4weight_input').prop('disabled',true)
        $('#con4type_input').prop('disabled',true)

        $.ajax({
            url: API_URL+'/client/readClients',
            type: "get",
            dataType: 'json',
            success : (function (data) 
            {
                if (data.message == '0') 
                {
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ No hay clientes registrados.")

                }else
                {  
                    // CLIENT selection fill...
                    $('#cliente_select').empty()
                    $('#cliente_select').append("<option value=''>SELECCIONA</option>")
                    for (let index = 0; index < data.client_names.length; index++) 
                    {
                        $('#cliente_select').append(
                        "<option value='"+data.client_names[index]+"'>"+data.client_names[index]+"</option>"
                        )
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
                $('#truck_loader').fadeOut(500)
                animationFunction.animateTruck(false)
            }, 

            //async:false
        })

        let data2Send = {'transporter_name':''}
        $.ajax({
            url: API_URL+'/readTransporters',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data2Send),
            success : (function (data) 
            {
                if (data.message == '0') 
                {
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ No hay transportistas registrados.")

                }else
                {  
                    // TRANSPORTER selection fill...
                     $('#transportista_select').empty()
                    $('#transportista_select').append("<option value=''>SELECCIONA</option>")
                    for (let index = 0; index < data.transportersFound.length; index++) 
                    {
                        $('#transportista_select').append(
                            "<option value='"+data.transportersFound[index].transporter_name+"'>"+data.transportersFound[index].transporter_name+"</option>"
                        )
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
                $('#truck_loader').fadeOut(500)
                animationFunction.animateTruck(false)
            }, 

            //async:false
        })



    }

    function saveNewManeuver()
    {
        /** - Step [1]
        *   - Gather and format data...
        */

        // Block 1 PDI get data...
        let man_cliente     = validateField($("#cliente_select").val())   ? $("#cliente_select").val().toUpperCase()   : 'SIN DATO ASIGNADO'
        let man_modalidad   = validateField($("#modalidad_select").val()) ? $("#modalidad_select").val().toUpperCase() : 'SIN DATO ASIGNADO'
        let man_despacho    = $("#despacho_input").val()   
        let man_aa          = validateField($("#aa_input").val())        ? $("#aa_input").val().toUpperCase()        : 'SIN DATO ASIGNADO'
        let man_ejecutiva   = validateField($("#ejecutiva_input").val()) ? $("#ejecutiva_input").val().toUpperCase() : 'SIN DATO ASIGNADO'

        // BLock 2 LOCATION data... 
        let man_terminal = validateField($("#terminal_select").val()) ? $("#terminal_select").val().toUpperCase() : 'SIN DATO ASIGNADO' 
        let man_descarga = validateField($("#descarga_select").val()) ? $("#descarga_select").val().toUpperCase() : 'SIN DATO ASIGNADO'
        
        let man_descarga_extraLocation = ''
        if(man_descarga === 'OTRO') 
        {
            man_descarga               = validateField($("#descargaExtra_nombre").val())    ? $("#descargaExtra_nombre").val().toUpperCase()    : 'SIN DATO ASIGNADO' 
            man_descarga_extraLocation = validateField($("#descargaExtra_ubicacion").val()) ? $("#descargaExtra_ubicacion").val().toUpperCase() : 'SIN DATO ASIGNADO'       
        } 

        // Block 3 OPERATIONS data...
        let man_transportista = validateField($("#transportista_select").val()) ? $("#transportista_select").val().toUpperCase() : 'SIN DATO ASIGNADO'  
        let man_eco           = validateField($("#eco_select").val())           ? $("#eco_select").val().toUpperCase()           : 'SIN DATO ASIGNADO'  
        let man_operador      = validateField($("#operador_select").val())      ? $("#operador_select").val().toUpperCase()      : 'SIN DATO ASIGNADO'  
        let man_gpsLink       = validateField($("#gps_input").val())            ? $("#gps_input").val().toUpperCase()            : 'SIN DATO ASIGNADO'  

        // Block 4 CONTAINER 1...
        let manCont_1_id        = validateField($("#con1ID_input").val())      ? $("#con1ID_input").val().toUpperCase()      : 'NO ASIGNADO' 
        let manCont_1_size      = validateField($("#con1Size_select").val())   ? $("#con1Size_select").val().toUpperCase()   : '-' 
        let manCont_1_contenido = validateField($("#con1Content_input").val()) ? $("#con1Content_input").val().toUpperCase() : '-' 
        let manCont_1_peso      = validateField($("#con1weight_input").val())  ? $("#con1weight_input").val().toUpperCase()  : '-' 
        let manCont_1_tipo      = validateField($("#con1type_input").val())    ? $("#con1type_input").val().toUpperCase()    : '-' 

        // Block 5 CONTAINER 2...
        let manCont_2_id        = validateField($("#con2ID_input").val())      ? $("#con2ID_input").val().toUpperCase()      : 'NO ASIGNADO' 
        let manCont_2_size      = validateField($("#con2Size_select").val())   ? $("#con2Size_select").val().toUpperCase()   : '-' 
        let manCont_2_contenido = validateField($("#con2Content_input").val()) ? $("#con2Content_input").val().toUpperCase() : '-' 
        let manCont_2_peso      = validateField($("#con2weight_input").val())  ? $("#con2weight_input").val().toUpperCase()  : '-' 
        let manCont_2_tipo      = validateField($("#con2type_input").val())    ? $("#con2type_input").val().toUpperCase()    : '-' 

        // Block 6 CONTAINER 3...
        let manCont_3_id        = validateField($("#con3ID_input").val())      ? $("#con3ID_input").val().toUpperCase()      : 'NO ASIGNADO' 
        let manCont_3_size      = validateField($("#con3Size_select").val())   ? $("#con3Size_select").val().toUpperCase()   : '-' 
        let manCont_3_contenido = validateField($("#con3Content_input").val()) ? $("#con3Content_input").val().toUpperCase() : '-' 
        let manCont_3_peso      = validateField($("#con3weight_input").val())  ? $("#con3weight_input").val().toUpperCase()  : '-' 
        let manCont_3_tipo      = validateField($("#con3type_input").val())    ? $("#con3type_input").val().toUpperCase()    : '-' 

        // Block 7 CONTAINER 4...
        let manCont_4_id        = validateField($("#con4ID_input").val())      ? $("#con4ID_input").val().toUpperCase()      : 'NO ASIGNADO' 
        let manCont_4_size      = validateField($("#con4Size_select").val())   ? $("#con4Size_select").val().toUpperCase()   : '-' 
        let manCont_4_contenido = validateField($("#con4Content_input").val()) ? $("#con4Content_input").val().toUpperCase() : '-' 
        let manCont_4_peso      = validateField($("#con4weight_input").val())  ? $("#con4weight_input").val().toUpperCase()  : '-' 
        let manCont_4_tipo      = validateField($("#con4type_input").val())    ? $("#con4type_input").val().toUpperCase()    : '-' 

        let data2Send = 
        {
            'man_cliente':man_cliente,
            'man_modalidad':man_modalidad,
            'man_despacho':man_despacho,
            'man_aa':man_aa,
            'man_ejecutiva':man_ejecutiva,
            'man_terminal':man_terminal,
            'man_descarga':man_descarga,
            'man_descarga_extraLocation':man_descarga_extraLocation,
            'man_transportista':man_transportista,
            'man_eco':man_eco,
            'man_operador':man_operador,
            'man_gpsLink':man_gpsLink,
            'manCont_1_id':manCont_1_id,
            'manCont_1_size':manCont_1_size,
            'manCont_1_contenido':manCont_1_contenido,
            'manCont_1_peso':manCont_1_peso,
            'manCont_1_tipo':manCont_1_tipo,
            'manCont_2_id':manCont_2_id,
            'manCont_2_size':manCont_2_size,
            'manCont_2_contenido':manCont_2_contenido,
            'manCont_2_peso':manCont_2_peso,
            'manCont_2_tipo':manCont_2_tipo,
            'manCont_3_id':manCont_3_id,
            'manCont_3_size':manCont_3_size,
            'manCont_3_contenido':manCont_3_contenido,
            'manCont_3_peso':manCont_3_peso,
            'manCont_3_tipo':manCont_3_tipo,
            'manCont_4_id':manCont_4_id,
            'manCont_4_size':manCont_4_size,
            'manCont_4_contenido':manCont_4_contenido,
            'manCont_4_peso':manCont_4_peso,
            'manCont_4_tipo':manCont_4_tipo
        }

        //LOADER...!
        $('#truck_loader').css('display','grid').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        $.ajax({
        url: API_URL+'/man/saveNewManeuver',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data2Send),
        success : (function (data) 
        {
            switch (data.message) 
            {
                case '1':
                    let notification_msg = ['¡Maniobra guardada! ⛟ ']
                    display_notification('ok', notification_msg) 

                    resetForm('addManeuver_formFields')
                    $('#con1weight_input').removeClass()
                    $('#con1weight_input').addClass('containers_weight')

                    $('#con2weight_input').removeClass()
                    $('#con2weight_input').addClass('containers_weight')
                    
                    $('#con3weight_input').removeClass()
                    $('#con3weight_input').addClass('containers_weight')

                    $('#con4weight_input').removeClass()
                    $('#con4weight_input').addClass('containers_weight')

                    actualPage = animationFunction.navigateToView('addManeuverPage','homePage',false,'flex')        
                break;
            
                case '0':
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ No se pudo guardar la maniobra")
                    $('#errorText').append("<p>🛈 Revisa los datos ingresados.</p>")
                break;
            }
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
            $('#truck_loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
        })  


    }

    function checkContainers(container_id, container_size, container_weight)
    {
        switch (true) 
        {
            case container_size === 20 && container_weight < 20:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_ok')  
            break;

            case container_size === 20 && container_weight >= 20 && container_weight < 26:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_warning')  
            break;

            case container_size === 20 && container_weight >= 26:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_exceed')  
            break;
            
            case container_size === 40 && container_weight < 26:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_ok')  
            break;

            case container_size === 40 && container_weight >= 26 && container_weight < 30:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_warning')  
            break;

            case container_size === 40 && container_weight >= 30:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_exceed')  
            break;
        
            default:
                $('#'+container_id+'').removeClass()    
                $('#'+container_id+'').addClass('containers_weight limit_default')  
            break;
        }
    }

//#endregion [ADD MANEUVER PAGE ]





//#region [ MANEUVERS PAGE ]

var allManeuvers
var reusableManeuverID
function getAllManeuversID()
{
    //LOADER...!
    $('#truck_loader').css('display','flex').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    $.ajax({
        url: API_URL+'/man/getAllManeuvers',
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

                actualPage = animationFunction.navigateToView('maneuversPage','homePage',false,'flex') 
            }else
            {  
                allManeuvers = data.objectsFound

                for (let index = 0; index < data.objectsFound.length; index++) 
                {
                    fillIDDashboard(data.objectsFound[index])
                }

                preloadFilterControls()
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
            $('#truck_loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 

        //async:false
    })
}

function fillIDDashboard(parameters)
{   
    let isFinished         = validateField(parameters.man_termino) ? parameters.man_termino : "Aún en curso"
    let selectedOptionFlag = ['','','','','','']
    let enabledOptions     = ''
    let moniEnableStatus   = parameters.man_moni_enable  === 'true' ?  "checked" : ""

    switch (parameters.maneuver_current_location) 
    {
        case 'SIN INICIAR':
            selectedOptionFlag[0] = 'selected'
        break;
    
        case 'ASLA':
            selectedOptionFlag[1] = 'selected'

            let statusSelected_asla = ['','','','','']
            switch (parameters.maneuver_current_status) 
            {
                case 'EN ESPERA':
                    statusSelected_asla[1] = 'selected'    
                break;
                
                case 'LLAMADO':
                    statusSelected_asla[2] = 'selected'
                break;

                case 'CANCELADO':
                    statusSelected_asla[3] = 'selected'    
                break;
                
                case 'EVENTO EXTRA':
                    statusSelected_asla[4] = 'selected'
                break;

                default:
                    statusSelected_asla[0] = 'selected'
                break;
            }
       
            enabledOptions = "<option "+statusSelected_asla[0]+" value=''>SELECCIONAR</option>"+
                             "<option "+statusSelected_asla[1]+" value='EN ESPERA'>EN ESPERA</option>"+
                             "<option "+statusSelected_asla[2]+" value='LLAMADO'>LLAMADO</option>"+
                             "<option "+statusSelected_asla[3]+" value='CANCELADO'>CANCELADO</option>"+
                             "<option "+statusSelected_asla[4]+" value='EVENTO EXTRA'>EVENTO EXTRA</option>"
        break;

        case 'EN RUTA':
            selectedOptionFlag[2] = 'selected'

            let statusSelected_ruta = ['','','','']
            switch (parameters.maneuver_current_status) 
            {
                case 'EN RUTA A TERMINAL':
                    statusSelected_ruta[1] = 'selected'    
                break;
                
                case 'EN RUTA A PATIO':
                    statusSelected_ruta[2] = 'selected'
                break;

                case 'EVENTO EXTRA':
                    statusSelected_ruta[3] = 'selected'
                break;

                default:
                    statusSelected_ruta[0] = 'selected'
                break;
            }

            enabledOptions = "<option "+statusSelected_ruta[0]+" value=''>SELECCIONAR</option>"+
                             "<option "+statusSelected_ruta[1]+" value='EN RUTA A TERMINAL'>EN RUTA A TERMINAL</option>"+
                             "<option "+statusSelected_ruta[2]+" value='EN RUTA A PATIO'>EN RUTA A PATIO</option>"+
                             "<option "+statusSelected_ruta[3]+" value='EVENTO EXTRA'>EVENTO EXTRA</option>"
        break;

        case 'EN TERMINAL':
            selectedOptionFlag[3] = 'selected'

            let statusSelected_terminal = ['','','','']
            switch (parameters.maneuver_current_status) 
            {
                case 'ESPERANDO A SER CARGADO':
                    statusSelected_terminal[1] = 'selected'    
                break;

                case 'CARGADO':
                    statusSelected_terminal[2] = 'selected'    
                break;

                case 'EVENTO EXTRA':
                    statusSelected_terminal[3] = 'selected'
                break;

                default:
                    statusSelected_terminal[0] = 'selected'
                break;
            }

            enabledOptions = "<option "+statusSelected_terminal[0]+" value=''>SELECCIONAR</option>"+
                             "<option "+statusSelected_terminal[1]+" value='ESPERANDO A SER CARGADO'>ESPERANDO A SER CARGADO</option>"+
                             "<option "+statusSelected_terminal[2]+" value='CARGADO'>CARGADO</option>"+
                             "<option "+statusSelected_terminal[3]+" value='EVENTO EXTRA'>EVENTO EXTRA</option>"
        break;

        case 'RUTA FISCAL / MODULACIÓN':
            selectedOptionFlag[4] = 'selected'

            let statusSelected_fiscal = ['','','','','','']
            switch (parameters.maneuver_current_status) 
            {
                case 'SIN MODULAR':
                    statusSelected_fiscal[1] = 'selected'    
                break;

                case 'VERDE':
                    statusSelected_fiscal[2] = 'selected'    
                break;

                case 'AMARILLO':
                    statusSelected_fiscal[3] = 'selected'
                break;

                case 'ROJO':
                    statusSelected_fiscal[3] = 'selected'
                break;

                case 'EVENTO EXTRA':
                    statusSelected_fiscal[4] = 'selected'
                break;

                default:
                    statusSelected_fiscal[0] = 'selected'
                break;
            }

            enabledOptions = "<option "+statusSelected_fiscal[0]+" value=''>SELECCIONAR</option>"+ 
                             "<option "+statusSelected_fiscal[1]+" value='SIN MODULAR'>SIN MODULAR</option>"+
                             "<option "+statusSelected_fiscal[2]+" value='VERDE'>VERDE</option>"+
                             "<option "+statusSelected_fiscal[3]+" value='AMARILLO'>AMARILLO</option>"+
                             "<option "+statusSelected_fiscal[4]+" value='ROJO'>ROJO</option>"+
                             "<option "+statusSelected_fiscal[5]+" value='EVENTO EXTRA'>EVENTO EXTRA</option>"
        break;

        case 'EN PATIO':
            selectedOptionFlag[5] = 'selected'

            let statusSelected_patio = ['','','','']
            switch (parameters.maneuver_current_status) 
            {
                case 'ESPERANDO A SER DESCARGADO':
                    statusSelected_patio[1] = 'selected'    
                break;

                case 'FINALIZADO':
                    statusSelected_patio[2] = 'selected'    
                break;

                case 'EVENTO EXTRA':
                    statusSelected_patio[3] = 'selected'
                break;

                default:
                    statusSelected_patio[0] = 'selected'
                break;
            }

            enabledOptions = "<option "+statusSelected_patio[0]+" value=''>SELECCIONAR</option>"+
                             "<option "+statusSelected_patio[1]+" value='ESPERANDO A SER DESCARGADO'>ESPERANDO A SER DESCARGADO</option>"+
                             "<option "+statusSelected_patio[2]+" value='FINALIZADO'>FINALIZADO</option>"+
                             "<option "+statusSelected_patio[3]+" value='EVENTO EXTRA'>EVENTO EXTRA</option>"
        break;
    }

    $('#maneuvuers_scrollableContainer').append(
    "<div class='maneuverContainer'>"+
    "<div class='mainRow'>"+
    "<table class='briefingTable'>"+
    "<tr class='tableHeader'>"+
    "<th>ID</th>"+
    "<th>1ER CONTENEDOR</th>"+
    "<th>%</th>"+
    "<th>UBICACIÓN</th>"+
    "<th>ESTATUS</th>"+
    "<th>CLIENTE</th>"+
    "<th>MODALIDAD</th>"+
    "<th>FECHA DE DESPACHO</th>"+
    "<th>FECHA DE TERMINO</th>"+
    "</tr>"+
    "<tr class='tableData'>"+
    "<td class='tableData_folio'><input type='text' value='"+parameters.man_folio+"'></input></td>"+
    "<td class='tableData_folio2'><input type='text' value='"+parameters.manCont_1_id+"'></input></td>"+
    "<td class='tableData_percentage'>"+parameters.maneuver_events[parameters.maneuver_events.length-1]+"</td>"+
    "<td class='tableData_select'>"+
    "<select class='tableData_location'>"+
    "<option value='SIN INICIAR' "+selectedOptionFlag[0]+">SIN INICIAR</option>"+
    "<option value='ASLA' "+selectedOptionFlag[1]+">ASLA</option>"+
    "<option value='EN RUTA' "+selectedOptionFlag[2]+">EN RUTA</option>"+
    "<option value='EN TERMINAL' "+selectedOptionFlag[3]+">EN TERMINAL</option>"+
    "<option value='RUTA FISCAL / MODULACIÓN' "+selectedOptionFlag[4]+">RUTA FISCAL / MODULACIÓN</option>"+
    "<option value='EN PATIO' "+selectedOptionFlag[5]+">EN PATIO</option>"+
    "</select>"+
    "</td>"+
    "<td class='tableData_select'>"+
    "<select class='tableData_event'>"+
    enabledOptions+
    "</select>"+
    "</td>"+
    "<td class='tableData_client'>"+parameters.man_cliente+"</td>"+
    "<td class='tableData_mode'>"+parameters.man_modalidad+"</td>"+
    "<td class='tableData_dispatch'>"+parameters.man_despacho+"</td>"+
    "<td class='tableData_finish'>"+isFinished+"</td>"+
    "</tr>"+
    "</table>"+
    "<button class='briefBtn'>"+
    "<img src='img/nav_arrow_white.svg' alt=''>"+
    "</button>"+
    "</div>"+
    "<div class='detailsRow hidden'>"+
    "<div class='containersTable'>"+
    "<div class='containersTable_header'>CONTENEDORES</div>"+
    "<div class='containersData'>"+
    "<div class='containerRow'>"+
    "<div class='containerRow_ids'>"+
    "<p>"+parameters.manCont_1_id+"</p>"+
    "</div>"+
    "<div class='containerRow_data'>"+
    "<p class=''>"+parameters.manCont_1_size+"</p>"+
    "<p class=''>"+parameters.manCont_1_tipo+"</p>"+
    "<p class=''>"+parameters.manCont_1_contenido+"</p>"+
    "</div>"+
    "</div>"+
    "<div class='containerRow '>"+
    "<div class='containerRow_ids '>"+
    "<p>"+parameters.manCont_2_id+"</p>"+
    "</div>"+
    "<div class='containerRow_data'>"+
    "<p class=''>"+parameters.manCont_2_size+"</p>"+
    "<p class=''>"+parameters.manCont_2_tipo+"</p>"+
    "<p class=''>"+parameters.manCont_2_contenido+"</p>"+
    "</div>"+
    "</div>"+
    "<div class='containerRow '>"+
    "<div class='containerRow_ids '>"+
    "<p>"+parameters.manCont_3_id+"</p>"+
    "</div>"+
    "<div class='containerRow_data'>"+
    "<p class=''>"+parameters.manCont_3_size+"</p>"+
    "<p class=''>"+parameters.manCont_3_tipo+"</p>"+
    "<p class=''>"+parameters.manCont_3_contenido+"</p>"+
    "</div>"+
    "</div>"+
    "<div class='containerRow '>"+
    "<div class='containerRow_ids '>"+
    "<p>"+parameters.manCont_4_id+"</p>"+
    "</div>"+
    "<div class='containerRow_data'>"+
    "<p class=''>"+parameters.manCont_4_size+"</p>"+
    "<p class=''>"+parameters.manCont_4_tipo+"</p>"+
    "<p class=''>"+parameters.manCont_4_contenido+"</p>"+
    "</div>"+
    "</div>"+
    "</div>"+
    "</div>"+
    "<div class='detailsContainer'>"+
    "<div class='detailsContainer_topRow '>"+ 
    "<div class='maneuverOperation'>"+
    "<table>"+
    "<tr class='tableHeader'>"+
    "<th>ECO</th>"+
    "<td>"+parameters.man_eco+"</td>"+
    "</tr>"+
    "<tr class='tableHeader'>"+
    "<th>OPERADOR</th>"+
    "<td>"+parameters.man_operador+"</td>"+
    "</tr>"+
    "<tr class='tableHeader'>"+
    "<th>PLACAS</th>"+
    "<td>"+parameters.man_placas+"</td>"+
    "</tr>"+
    "<tr class='tableHeader'>"+
    "<th>TRANSPORTISTA</th>"+
    "<td>"+parameters.man_transportista+"</td>"+
    "</tr>"+
    "</table>"+
    "</div>"+
    "<div class='maneuverOptions'>"+
    "<button class='widget_btn btn_deleteManeuver'>"+
    "<img src='img/delete_red.svg' alt=''>"+
    "</button>"+
    "<button class='widget_btn btn_gpsManeuver'>"+
    "<img src='img/location_orange.svg' alt=''>"+
    "</button>"+
    "<button class='widget_btn btn_monitorManeuver'>"+
    "<img src='img/see_orange.svg' alt=''>"+
    "</button>"+
    "</div>"+
    "</div>"+
    "<div class='detailsContainer_botRow'>"+
    "<table>"+
    "<tr class='tableHeader'>"+
    "<th>AA</th>"+
    "<th>EJECUTIVA</th>"+
    "<th>TRANSPORTISTA</th>"+
    "<th>CAAT</th>"+
    "<th>TERMINAL</th>"+
    "<th>DESCARGA</th>"+
    "<th>BLOQUE / TURNO</th>"+
    "</tr>"+
    "<tr>"+
    "<td>"+parameters.man_aa+"</td>"+
    "<td>"+parameters.man_ejecutiva+"</td>"+
    "<td>"+parameters.man_transportista+"</td>"+
    "<td>"+parameters.man_caat+"</td>"+
    "<td>"+parameters.man_terminal+"</td>"+
    "<td>"+parameters.man_descarga+"</td>"+
    "<td>"+parameters.man_despacho+"</td>"+
    "</tr>"+
    "</table>"+
    "<div class='maneuverNotes'>"+
    "<textarea placeholder='Puedes ingresar una NOTA aquí.' class='note'>"+parameters.man_note+"</textarea>"+
    "<button class='widget_btn btn_updateNote'>"+
    "<img src='img/editar.svg' alt=''>"+
    "</button>"+
    "<input class='enable_monitor' type='checkbox' "+moniEnableStatus+">"+
    "</div>"+
    "</div>"+
    "</div>"+
    "</div>"+
    "</div>"  
    )
}

function preloadFilterControls()
{
    $.ajax({
        url: API_URL+'/client/readClients',
        type: "get",
        dataType: 'json',
        success : (function (data) 
        {
            if (data.message == '0') 
            {
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ No hay clientes registrados.")

            }else
            {  
                // CLIENT selection fill...
                $('#cliente_filter').empty()
                $('#cliente_filter').append("<option value=''>SELECCIONA</option>")
                for (let index = 0; index < data.client_names.length; index++) 
                {
                    $('#cliente_filter').append(
                    "<option value='"+data.client_names[index]+"'>"+data.client_names[index]+"</option>"
                    )
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
            $('#truck_loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 
    })

    let data2Send = {'transporter_name':''}
    $.ajax({
        url: API_URL+'/readTransporters',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data2Send),
        success : (function (data) 
        {
            if (data.message == '0') 
            {
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ No hay transportistas registrados.")

            }else
            {  
                // TRANSPORTER selection fill...
                 $('#transportista_filter').empty()
                $('#transportista_filter').append("<option value=''>SELECCIONA</option>")
                for (let index = 0; index < data.transportersFound.length; index++) 
                {
                    $('#transportista_filter').append(
                        "<option value='"+data.transportersFound[index].transporter_name+"'>"+data.transportersFound[index].transporter_name+"</option>"
                    )
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
            $('#truck_loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 

        //async:false
    })


}

/* +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * + [⚑] FILTER POP UP...                                                                          +                                                                +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+*/ 

// Close FILTER POP-UP...
$('.filter_options_left').click(function()
{
    switch (actualPage) 
    {
        case 'maneuversPage':
            animationFunction.shrinkAnimation('filter_container',false,'none')
        break;
    
        default: break;
    }
});

// Search button on FILTER POP-UP...
$('#search_btn').click(function() 
{
  if(validateField(useFilter(allManeuvers)))
  {
    $('#maneuvuers_scrollableContainer').empty()
    for (let index = 0; index < useFilter(allManeuvers).length; index++) 
    {
        fillIDDashboard(useFilter(allManeuvers)[index])    
    }
  }else
  {
    $('#maneuvuers_scrollableContainer').empty()
    for (let index = 0; index < allManeuvers.length; index++) 
    {
        fillIDDashboard(allManeuvers[index]) 
        $('.pop-error').removeClass('hidden')
        $('.pop-error').addClass('pop-up')
        $('.pop-up').fadeIn(500)
        $('#errorText').text("⛟ MANIOBRA NO ENCONTRADA")
        $('#errorText').append("<p>🛈 Revisa los datos de búsqueda.</p>")        
        $('#errorText').append("<p>🛈 Mostrando todas las maniobras.</p>")        
    }
  }

  animationFunction.shrinkAnimation('filter_container',false,'none')
  resetForm('filter-col')
})

// Dynamically change operator select according to transporter SELECT value...
$('.filter-col').on('change','#transportista_filter', (e)=> 
{
    //LOADER...!
    $('#truck_loader').css('display','flex').hide().fadeIn(200);
    animationFunction.animateTruck(true)
    
    //Get value from SELECT control change...
    let transporter_name = $(e.target).closest('#filter_container')
    .find('.filter-col')
    .find('#transportista_filter').val();

    if (validateField(transporter_name)) 
    {
        let data2Send = {'transporter_name':transporter_name}
    
        $.ajax({
        url: API_URL+'/readTransporters',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data2Send),
        success : (function (data) 
        {
            if (data.message == '0') 
            {
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ No hay transportistas registrados.")
            }else
            {  
                // OPERATOR SELECT CONTROL fill...
                $('#operador_filter').empty()
                $('#operador_filter').append("<option value=''>SELECCIONA</option>")
                for (let index = 0; index < data.transportersFound[0].transporter_operators.length; index++) 
                {
                    $('#operador_filter').append(
                        "<option value='"+data.transportersFound[0].transporter_operators[index]+"'>"+data.transportersFound[0].transporter_operators[index]+"</option>"
                    )
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
            $('#truck_loader').fadeOut(500)
            animationFunction.animateTruck(false)
        }, 
        //async:false
        })
    }else
    {
        $('#operador_filter').empty()
                
        // LOADER...
        $('#truck_loader').fadeOut(500)
        animationFunction.animateTruck(false)   
    } 
    
})

function useFilter(allManeuvers)
{
    /* - Step[1]
    *  - Get values from filters form...
    */

    const availableFilters  = ['folio_filter','placas_filter','contedores_filter','cliente_filter','transportista_filter','operador_filter','finished_filter','from_date_filter','until_date_filter']
    let usedFilters         = []
    let filteredMAneuvers   = []

    for (let index = 0; index < availableFilters.length; index++) 
    {
        if (index != 6 ) 
        {
            validateField($('#'+availableFilters[index]).val()) ? 
            usedFilters.push($('#'+availableFilters[index]).val())
            :
            usedFilters.push('0')
        }else
        {
            $('#'+availableFilters[index]).is(":checked") ?
            usedFilters.push($('#'+availableFilters[index]).val())
            :
            usedFilters.push('0')
        }
    }

    /* - Step[2]  
    *  - Start filtering to return new array... 
    */

    //Search only by ID...
    if (usedFilters[0] != '0') 
    {
        for (let index = 0; index < allManeuvers.length; index++) 
        {
            if (usedFilters[0] === allManeuvers[index].man_folio) filteredMAneuvers.push(allManeuvers[index])
        }

        if (filteredMAneuvers.length > 0) return filteredMAneuvers
    }

    //Search only by PLATES...
    if (usedFilters[1] != '0') 
    {
        for (let index = 0; index < allManeuvers.length; index++) 
        {
            if (usedFilters[1] === allManeuvers[index].man_placas) filteredMAneuvers.push(allManeuvers[index])
        }
    
        if (filteredMAneuvers.length > 0) return filteredMAneuvers
    }

    //Search only by CONTAINERS ID...
    let containersID_search
    if (usedFilters[2] != '0') 
    {
        containersID_search = usedFilters[2].split(",")
        containersID_search = containersID_search.filter(nonEmpty => nonEmpty !=="")
        console.log(containersID_search);
        
        for (let i = 0; i < containersID_search.length; i++) 
        {
            for (let index = 0; index < allManeuvers.length; index++) 
            {
                if (containersID_search[i] === allManeuvers[index].manCont_1_id || containersID_search[i] === allManeuvers[index].manCont_2_id || containersID_search[i] === allManeuvers[index].manCont_3_id || containersID_search[i] === allManeuvers[index].manCont_4_id) filteredMAneuvers.push(allManeuvers[index])
            }
        }
        
        if (filteredMAneuvers.length > 0) return filteredMAneuvers
    }

    //Search only by CLIENT...
    if (usedFilters[3] != '0') 
    {
        for (let index = 0; index < allManeuvers.length; index++) 
        {
            if (usedFilters[3] === allManeuvers[index].man_cliente) filteredMAneuvers.push(allManeuvers[index])
        }
    
        if (filteredMAneuvers.length > 0) return filteredMAneuvers
    }

    //Search only by TRANSPORTER...
    if (usedFilters[4] != '0') 
    {   
        //Search only by OPERATOR...
        if (usedFilters[5] != '0') 
        {   
            for (let index = 0; index < allManeuvers.length; index++) 
            {
                if (usedFilters[5] === allManeuvers[index].man_operador) filteredMAneuvers.push(allManeuvers[index])
            }
        
            if (filteredMAneuvers.length > 0) return filteredMAneuvers
        }else
        {
            for (let index = 0; index < allManeuvers.length; index++) 
                {
                    if (usedFilters[4] === allManeuvers[index].man_transportista) filteredMAneuvers.push(allManeuvers[index])
                }
            
                if (filteredMAneuvers.length > 0) return filteredMAneuvers
        }
        
    }

    //Search only maneuvers with 100% COMPLETION...
    if (usedFilters[6] != '0') 
    {  
        for (let index = 0; index < allManeuvers.length; index++) 
        {
            if ('FINALIZADO' === allManeuvers[index].maneuver_current_status) filteredMAneuvers.push(allManeuvers[index])
        }
        
        if (filteredMAneuvers.length > 0) return filteredMAneuvers
    }

    //Search only between two dates...
    if (usedFilters[7] != '0') 
    {  
        let date_from = new Date(usedFilters[7]);

        if (usedFilters[8] != '0') 
        {   
            let date_to = new Date(usedFilters[8]);
            for (let index = 0; index < allManeuvers.length; index++) 
            {
                let date_to_check = new Date (allManeuvers[index].man_despacho)
                if ( date_to_check >= date_from && date_to_check <= date_to) filteredMAneuvers.push(allManeuvers[index])
            }
        }else
        {
            for (let index = 0; index < allManeuvers.length; index++) 
            {
                let date_to_check = new Date (allManeuvers[index].man_despacho)
                if (date_to_check >= date_from) filteredMAneuvers.push(allManeuvers[index])
            }
        }
        
        if (filteredMAneuvers.length > 0) return filteredMAneuvers
    }
}

/* +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * + [⚑] GPS POP UP...                                                                          +                                                                +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+*/ 
$('#updateGPS_container_close').click(function()
{
    switch (actualPage) 
    {
        case 'maneuversPage':
            animationFunction.shrinkAnimation('updateGPS_container',false,'none')
        break;
    
        default: break;
    }
})
 

$('#updateGPS_container_save').click(function() 
{
    let newGPSlink = $('#gps_link').val().trim()

    if (validateField(newGPSlink) && validateField(reusableManeuverID)) 
    {
        //LOADER...!
        $('#truck_loader').css('display','grid').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        let data2send = {'man_folio':reusableManeuverID, 'man_gpsLink':newGPSlink}

        $.ajax({
            url: API_URL+'/man/updateTrackingLink',
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(data2send),
            success : (function (data) 
            {
                switch (data.message) 
                {
                    case '1':
                        $('.pop-ok').removeClass('hidden')
                        $('.pop-ok').addClass('pop-up')
                        $('.pop-up').fadeIn(500)
                        $('#okText').text("⛟ LINK de seguimiento actualizado con éxito")
                        
                        reusableManeuverID = ""
                        resetForm('filter-col')
                        animationFunction.shrinkAnimation('updateGPS_container',false,'none')
                    break;
                
                    case '0':
                        $('.pop-error').removeClass('hidden')
                        $('.pop-error').addClass('pop-up')
                        $('.pop-up').fadeIn(500)
                        $('#errorText').text("⛟ GPS LINK no actualizado")
                        $('#errorText').append("<p>🛈 La maniobra no se encontró en el sistema.</p>")

                        reusableManeuverID = ""
                        resetForm('filter-col')
                        animationFunction.shrinkAnimation('updateGPS_container',false,'none')
                    break;
                }
            }),
    
            error: function(XMLHttpRequest, textStatus, errorThrown) 
            {  
                $('.pop-error').removeClass('hidden')
                $('.pop-error').addClass('pop-up')
                $('.pop-up').fadeIn(500)
                $('#errorText').text("⛟ GPS LINK No actualizado")
                $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")

                reusableManeuverID = ""
                resetForm('filter-col')
                animationFunction.shrinkAnimation('updateGPS_container',false,'none')
            },
    
            complete: function() 
            {
                $('#truck_loader').fadeOut(200)
                animationFunction.animateTruck(false)
            },
        
            //async:false
        })    

    }
})

/* +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * + [⚑] BUTTONS OPTIONS...                                                                          +                                                                +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+*/ 

//EXPAND MANEUVER ROW...
$('#maneuvuers_scrollableContainer').on('click','.expand_btn', (e)=>
{

    console.log('test');
    //$(e.target).closest('.maneuverContainer').find('.detailsRow').toggleClass('hidden')

    const $detailsRow = $(e.target).closest('.maneuver_item').find('.collapsable_row')

    if ($detailsRow.hasClass('expandable'))
    {
        $detailsRow
        .removeClass('expandable') 
        .css('height', 0) 
        .animate(
            { height: $detailsRow.get(0).scrollHeight },150,
                function () 
                {
                    $(this).css('height', '');  
                }
        );
    }else
    {
        $detailsRow.animate(
            { height: 0 }, 150, 
            function () {
                $(this).addClass('expandable').css('height', ''); 
            }
        );
    }

})

//DELETE MANEUVER...
$('#maneuvuers_scrollableContainer').on('click','.btn_deleteManeuver', (e)=>
{
    /* console.log($(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text()); */

    let maneuverID_toDelete = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text()

    if (validateField(maneuverID_toDelete)) 
    {
        let data2delete = {'maneuverID_toDelete':maneuverID_toDelete}
        
        //LOADER...!
        $('#truck_loader').css('display','grid').hide().fadeIn(200);
        animationFunction.animateTruck(true)

        $.ajax({
        url: API_URL+'/man/deleteManeuver',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data2delete),
        success : (function (data) 
        {
            switch (data.message) 
            {
                case '1':
                    $('.pop-ok').removeClass('hidden')
                    $('.pop-ok').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#okText').text("⛟ Maniobra eliminada con éxito")
    
                    actualPage = animationFunction.navigateToView('maneuversPage','homePage',false,'flex') 
                break;
            
                case '0':
                    $('.pop-error').removeClass('hidden')
                    $('.pop-error').addClass('pop-up')
                    $('.pop-up').fadeIn(500)
                    $('#errorText').text("⛟ No se pudo eliminar la maniobra")
                    $('#errorText').append("<p>🛈 La maniobra no se encontró en el sistema.</p>")
                break;
            }
        }),
    
        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ No se pudo eliminar la maniobra")
            $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")
        },
    
        complete: function() 
        {
            $('#truck_loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
        
        })
    }
})
    
//UPDATE GPS LINK...
$('#maneuvuers_scrollableContainer').on('click','.btn_gpsManeuver',(e)=>
{ 
    animationFunction.growAnimation('updateGPS_container',false,'flex')

    reusableManeuverID = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text()
    
    $.ajax({
        url: API_URL+'/man/getGPS',
        type: 'get',
        contentType: 'application/json',
        data: reusableManeuverID,
        success : (function (data) 
        {
            if (data.message == '0') 
            {
                $(".gps_displayContainer").empty()
                $(".gps_displayContainer").append(
                    "MAPA NO DISPONIBLE"
                    //"<embed src='"+maneuverGPSlink+"' class='top view_100'>"
                )
            }else
            {  
                $(".gps_displayContainer").empty()
                $(".gps_displayContainer").append(
                    
                    "<embed src='"+data.trackingLink+"' class='view_100'>"
                )
            }    
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ MAPA NO DISPONIBLE")
            $('#errorText').append("<p>🛈 El servidor no pudo procesar la solicitud.</p>")
        },
    
        //async:false
    })     
 
})

//UPDATE NOTE...
$('#maneuvuers_scrollableContainer').on('click','.btn_updateNote',(e)=>
{ 
    reusableManeuverID = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text()

    let man_note = $(e.target).closest('.maneuverContainer')
    .find('.detailsContainer_botRow')
    .find('.maneuverNotes')
    .find('.note').val()

    let data2send = {'man_folio':reusableManeuverID, 'man_note':man_note}
    
    $.ajax({
        url: API_URL+'/man/updateNote',
        type: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(data2send),
        success : (function (data) 
        {
            switch (data.message) 
            {
                case '1':
                    $('#maneuvuers_scrollableContainer').empty()
                    getAllManeuversID()       
                    actualPage = animationFunction.navigateToView('maneuversPage','maneuversPage',false,'flex')
                break;
            }
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ No se pudo actualizar la maniobra")
            $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")
        },

        complete: function() 
        {
            $('#truck_loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
    }) 
 
})

//UPDATE enable monitor...
$('#maneuvuers_scrollableContainer').on('change','.enable_monitor',(e)=>
{ 
    reusableManeuverID = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text()

    let monitor_enabled = $(e.target).closest('.maneuverContainer')
    .find('.detailsContainer_botRow')
    .find('.maneuverNotes')
    .find('.enable_monitor')

    let enable_moni = monitor_enabled.is(':checked')? 'true':'false'

    let notification_msg =  monitor_enabled.is(':checked') ? 
    ['¡Maniobra actualizada! ⛟ ','* La maniobra ahora será visible para el cliente.']
    :
    ['¡Maniobra actualizada! ⛟ ','* La maniobra ya NO será visible para el cliente.']

    let data2send = {'man_folio':reusableManeuverID, 'man_moni_enable':enable_moni}

    $.ajax({
        url: API_URL+'/man/updateMoniStatus',
        type: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(data2send),
        success : (function (data) 
        {
            switch (data.message) 
            {
                case '1':
                    display_notification('ok', notification_msg) 
                    
                    $('#maneuvuers_scrollableContainer').empty()
                    getAllManeuversID()       
                    actualPage = animationFunction.navigateToView('maneuversPage','maneuversPage',false,'flex')
                break;

                case '0':
                    display_notification('warning', notification_msg) 
                    
                    $('#maneuvuers_scrollableContainer').empty()
                    getAllManeuversID()       
                    actualPage = animationFunction.navigateToView('maneuversPage','maneuversPage',false,'flex')
                break;
            }
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            console.log(XMLHttpRequest,textStatus,errorThrown);
            let notification_msg = ['¡No se puedo habilitar! ⛟ ','* Hubo un problema con la solicitud al servidor.']
            display_notification('error', notification_msg) 
        },

        complete: function() 
        {
            $('#truck_loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
    }) 
})


/* +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * + [⚑] SELECT OPTIONS...                                                                          +                                                                +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+*/ 
$('#maneuvuers_scrollableContainer').on('change','.tableData_event', (e)=> 
{
    /*      console.log($(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text()); */ 

    /* console.log($(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_location').val());  */

    let man_folio = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text();

    let location_update = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_location').val()

    let event_update = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_event').val()
    
    /* 
    let note_update = $(e.target).closest('.maneuverContainer')
    .find('.detailsContainer')
    .find('.detailsContainer_botRow')
    .find('.maneuverNotes')
    .find('.note').val() */

    let data2send = {'man_folio':man_folio, 'man_location':location_update,'man_event':event_update}
    

     $.ajax({
        url: API_URL+'/man/updateManeuverEvents',
        type: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify(data2send),
        success : (function (data) 
        {
            switch (data.message) 
            {
                case '1':
                    $('#maneuvuers_scrollableContainer').empty()
                    getAllManeuversID()       
                    actualPage = animationFunction.navigateToView('maneuversPage','maneuversPage',false,'flex')
                break;
            }
        }),

        error: function(XMLHttpRequest, textStatus, errorThrown) 
        {  
            $('.pop-error').removeClass('hidden')
            $('.pop-error').addClass('pop-up')
            $('.pop-up').fadeIn(500)
            $('#errorText').text("⛟ No se pudo actualizar la maniobra")
            $('#errorText').append("<p>🛈 El servidor no pudo procesar el guardado.</p>")
        },

        complete: function() 
        {
            $('#truck_loader').fadeOut(200)
            animationFunction.animateTruck(false)
        },
    
        //async:false
    })  
});

$('#maneuvuers_scrollableContainer').on('change','.tableData_location', (e)=> 
{
/*     console.log($(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_location').val());   */
/* 
    let man_folio = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text();

    let location_update = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_location').val()

    let event_update = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_event').val()  */

    let selectedLocation = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_location').val();  

    switch (selectedLocation) 
    {
        case 'SIN INICIAR':
            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').empty()
        break;
    
        case 'ASLA':
            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').empty()

            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='EN ESPERA'>EN ESPERA</option>"+
                "<option value='LLAMADO'>LLAMADO</option>"+
                "<option value='CANCELADO'>CANCELADO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'EN RUTA':
            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').empty()

            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='EN RUTA A TERMINAL'>EN RUTA A TERMINAL</option>"+
                "<option value='EN RUTA A PATIO'>EN RUTA A PATIO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'EN TERMINAL':
            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').empty()

            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='ESPERANDO A SER CARGADO'>ESPERANDO A SER CARGADO</option>"+
                "<option value='CARGADO'>CARGADO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'RUTA FISCAL / MODULACIÓN':
            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').empty()

            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='SIN MODULAR'>SIN MODULAR</option>"+
                "<option value='VERDE'>VERDE</option>"+
                "<option value='AMARILLO'>AMARILLO</option>"+
                "<option value='ROJO'>ROJO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'EN PATIO':
            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').empty()

            $(e.target).closest('.maneuverContainer')
            .find('.mainRow')
            .find('.briefingTable')
            .find('.tableData')
            .find('.tableData_event').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='ESPERANDO A SER DESCARGADO'>ESPERANDO A SER DESCARGADO</option>"+
                "<option value='FINALIZADO'>FINALIZADO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;
    }


});

//#endregion [ MANEUVERS PAGE ]





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
                    url: 'http://localhost:8080/addObject',
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
                url: 'http://localhost:8080/addObject',
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

//#endregion [ ADD EQUIPMENT VIEW ]











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
            url: 'http://localhost:8080/man/findManeuver',
            //url: 'https://maylob-backend.onrender.com/man/findManeuver',
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
        url: 'http://localhost:8080/man/findManeuver',
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









/*
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 * +                                                                                               +
 * + [⚑] AUXILIARY COMMON FUCTIONS...                                                              +
 * +                                                                                               +
 * +==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+==+
 */ 
//#region    [AUXILIARY COMMON FUCTIONS]

//Used to clean all from text INPUTS...
function resetForm(formClass){ $("."+formClass+"").find(':input').val('') }





function display_notification(status,messages)
{
    $('.notify_pop_up').css('display','flex').hide().fadeIn(200)

    $('.notify_text').empty()
    $('.notify_img').empty()

    for (let index = 0; index < messages.length; index++) 
    {
        if (index === 0) 
        {
            $('.notify_text').append('<p class = "notify_strong">'+messages[index]+'</p>')          
        }else
        {
            $('.notify_text').append('<p>'+messages[index]+'</p>')          
        }
    }

    switch (status) 
    {
        case 'ok':
            $('.notify_container').addClass('notify_ok')
            $('.notify_img').append('<img src="img/ok_white.svg" alt="">')
        break;
    
        case 'error':
            $('.notify_container').addClass('notify_error')
            $('.notify_img').append('<img src="img/error_white.svg" alt="">')
        break;

        default:
            $('.notify_container').addClass('notify_warning')
            $('.notify_img').append('<img src="img/warning_white.svg" alt="">')
        break;
    }
}

$('#close_notify').click(function() { $('.notify_pop_up').fadeOut(200) })


//#endregion [AUXILIARY COMMON FUCTIONS]









function getGPS(maneuver_id)
{
    //LOADER...!
    $('.toast-loader').css('display','grid').hide().fadeIn(200);
    animationFunction.animateTruck(true)

    $.ajax({
        url: API_URL+'/man/getGPS',
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



function saveManeuver(maneuver_type)
{
    /** - Step [1]
     *  - Gather and validate data...
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
                url: 'http://localhost:8080/man/addManeuver',
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
            url: 'http://localhost:8080/man/addManeuver',
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
        url: API_URL+'/man/findManeuver',
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
        url: API_URL+'/man/getManeuvers',
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
        url: API_URL+'/getAvailableObjects',
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

    //getAvailableManeuvers()
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
