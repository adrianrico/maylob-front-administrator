import * as animationFunction from '/js/gsap/indexAnimations.js';

// Landing page set default...
var actualPage = ''

// Used for local testing...
//const API_URL = 'http://127.0.0.1:8080'
const API_URL = 'https://maylob-backend.onrender.com'

//#region [ INITIAL VIEW ]

$('#go2clienManagement').click(function()
{
    preloadClientsNames()
    actualPage = animationFunction.navigateToView('homePage','clientManagementPage',false,'flex')
});

$('#go2addManeuvers').click(function()
{
    preloadPageControls()
    actualPage = animationFunction.navigateToView('homePage','addManeuverPage',false,'flex')
});

$('#go2maneuversID').click(function()
{
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

        case 'clientManagementPage':
           actualPage = animationFunction.navigateToView('clientManagementPage','homePage',false,'flex') 
        break;
    
        default: break;
    }
});

$('#save_btn').click(function()
{
    switch (actualPage) 
    {
        case 'maneuversPage':
            update_maneuvers()
        break;

        case 'addManeuverPage':
           saveNewManeuver() 
        break;

        case 'clientManagementPage':
           processClient() 
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





//#region [CLIENTS MANAGEMENT PAGE ]

async function preloadClientsNames()
{   
    display_loader(true)

    let client_names = await get_clients()

    const default_select_option =  '<option value="NUEVO">NUEVO</option>'    
    $('#cmp_client_select').empty()
    $('#cmp_client_select').append(build_select_options(client_names,default_select_option))
    
    display_loader(false)
}

function processClient() 
{
    /** - Step [1][A][B]
     *  - Validate entry before trying to execute API CALL...
     */
    let clientEntryData  = $('#cmp_input_entry_data').val()
    if (!validateField(clientEntryData)) 
    {
        let notification_msg = ['¡Datos no actualizados! ⛟ ','* Necesitas ingresar un nuevo dato.']
        display_notification('warning', notification_msg)    
    }else
    {
        /** - Step [2][A]
         *  - Build data structure...
         */
        let data2Send = { 'client_name':clientEntryData }

        /** - Step [3][A]
         *  - Process according of type of selection...
         */
        let selectedClient = $('#cmp_client_select').val()

        if (selectedClient === 'NUEVO') 
        {
            display_loader(true)

            $.ajax({
            url: API_URL+'/client/createClient',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data2Send),
            success : (function (data) 
            {
                if (data.message == '0') 
                {
                    let notification_msg = 
                    ['¡Datos no guardados! ⛟ ',
                     '* El servidor tuvo problemas para procesar los datos.',
                     '* Revisa si el cliente ya está registrado.'
                    ]
                    display_notification('warning', notification_msg)   
                }else
                {
                    $('#cmp_input_entry_data').val('')

                    preloadClientsNames()

                    let notification_msg = ['¡Cliente guardado! ⛟ ','* Guardado con éxito, presiona el botón para continuar.']
                    display_notification('ok', notification_msg) 
                }              
            }),

            error: function(serverResponse) 
            {   
                let notification_msg = ['¡Datos no guardados! ⛟ ','* El servidor tuvo problemas para procesar los datos.']
                display_notification('error', notification_msg)   
            },

            complete: function() 
            {
                display_loader(false)
            }, 

            //async:false
            })
        }else
        {             
            /** - Step [2][B]
             *  - Build data structure to be sent...
             */
            let data2Send = 
            { 
                'new_client_name':clientEntryData.toUpperCase(),
                'client_name_to_update':selectedClient
            }

            $.ajax({
            url: API_URL+'/client/updateClient',
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(data2Send),
            success : (function (data) 
            {
                if (data.message == '0') 
                {
                    let notification_msg = 
                    ['¡Datos no actualizados! ⛟ ',
                     '* El servidor tuvo problemas para encontrar al cliente.',
                     '* El cliente puede no estar registrado.'
                    ]
                    display_notification('warning', notification_msg)   
                }else
                {
                    $('#cmp_input_entry_data').val('')

                    preloadClientsNames()

                    let notification_msg = ['¡Cliente actualizado! ⛟ ','* Los datos se actualizaron con éxito, presiona el botón para continuar.']
                    display_notification('ok', notification_msg) 
                }
            }),

            error: function(serverResponse) 
            {   
                let notification_msg = ['¡Datos no actualizados! ⛟ ','* El servidor tuvo problemas para procesar los datos.']
                display_notification('error', notification_msg)   
            },

            complete: function() 
            {
                display_loader(false)
            }, 

            //async:false
            })
        }
    }

}


$('#cmp_form_container').on('click','.input_clear', (e)=>
{
    let clickedOption = $(e.target).closest('.input_container').find('.input_label').text()
    switch (clickedOption) 
    {
        case 'Nuevo dato de nombre.':
            $('#cmp_input_entry_data').val('')
        break;
    
        case 'Eliminar cliente.':
            let selectedClient = $('#cmp_client_select').val()

            let data2delete = {'client_name':selectedClient}

            if (selectedClient != 'NUEVO') 
            {
                $.ajax({
                url: API_URL+'/client/deleteClient',
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(data2delete),
                success : (function (data) 
                {
                    if (data.message == '0') 
                    {
                        let notification_msg = 
                        ['¡No se pudo eliminar! ⛟ ',
                        '* El servidor tuvo problemas para encontrar al cliente.',
                        '* El cliente puede no estar registrado.'
                        ]
                        display_notification('warning', notification_msg)   
                    }else
                    {
                        $('#cmp_input_entry_data').val('')

                        preloadClientsNames()

                        let notification_msg = ['¡Cliente eliminado! ⛟ ','* Los datos se eliminaron con éxito, presiona el botón para continuar.']
                        display_notification('ok', notification_msg) 
                    }
                }),

                error: function(serverResponse) 
                {   
                    let notification_msg = ['¡Datos no eliminados! ⛟ ','* El servidor tuvo problemas para procesar los datos.']
                    display_notification('error', notification_msg)   
                },

                complete: function() 
                {
                    display_loader(false)
                }, 

                //async:false
                })
            }
        break;
    }
})

//#endregion [CLIENTS MANAGEMENT PAGE ]





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
        let man_gpsLink       = validateField($("#gps_input").val())            ? $("#gps_input").val()                          : 'SIN DATO ASIGNADO'  

        // Block 4 CONTAINER 1...
        let manCont_1_id        = validateField($("#con1ID_input").val())      ? $("#con1ID_input").val().toUpperCase()      : '' 
        let manCont_1_size      = validateField($("#con1Size_select").val())   ? $("#con1Size_select").val().toUpperCase()   : '' 
        let manCont_1_contenido = validateField($("#con1Content_input").val()) ? $("#con1Content_input").val().toUpperCase() : '' 
        let manCont_1_peso      = validateField($("#con1weight_input").val())  ? $("#con1weight_input").val().toUpperCase()  : '' 
        let manCont_1_tipo      = validateField($("#con1type_input").val())    ? $("#con1type_input").val().toUpperCase()    : '' 

        // Block 5 CONTAINER 2...
        let manCont_2_id        = validateField($("#con2ID_input").val())      ? $("#con2ID_input").val().toUpperCase()      : '' 
        let manCont_2_size      = validateField($("#con2Size_select").val())   ? $("#con2Size_select").val().toUpperCase()   : '' 
        let manCont_2_contenido = validateField($("#con2Content_input").val()) ? $("#con2Content_input").val().toUpperCase() : '' 
        let manCont_2_peso      = validateField($("#con2weight_input").val())  ? $("#con2weight_input").val().toUpperCase()  : '' 
        let manCont_2_tipo      = validateField($("#con2type_input").val())    ? $("#con2type_input").val().toUpperCase()    : '' 

        // Block 6 CONTAINER 3...
        let manCont_3_id        = validateField($("#con3ID_input").val())      ? $("#con3ID_input").val().toUpperCase()      : '' 
        let manCont_3_size      = validateField($("#con3Size_select").val())   ? $("#con3Size_select").val().toUpperCase()   : '' 
        let manCont_3_contenido = validateField($("#con3Content_input").val()) ? $("#con3Content_input").val().toUpperCase() : '' 
        let manCont_3_peso      = validateField($("#con3weight_input").val())  ? $("#con3weight_input").val().toUpperCase()  : '' 
        let manCont_3_tipo      = validateField($("#con3type_input").val())    ? $("#con3type_input").val().toUpperCase()    : '' 

        // Block 7 CONTAINER 4...
        let manCont_4_id        = validateField($("#con4ID_input").val())      ? $("#con4ID_input").val().toUpperCase()      : '' 
        let manCont_4_size      = validateField($("#con4Size_select").val())   ? $("#con4Size_select").val().toUpperCase()   : '' 
        let manCont_4_contenido = validateField($("#con4Content_input").val()) ? $("#con4Content_input").val().toUpperCase() : '' 
        let manCont_4_peso      = validateField($("#con4weight_input").val())  ? $("#con4weight_input").val().toUpperCase()  : '' 
        let manCont_4_tipo      = validateField($("#con4type_input").val())    ? $("#con4type_input").val().toUpperCase()    : '' 

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
        {   console.log(data.message);
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
var client_names
var all_retrieved_transporters
var transporters
var todayManeuvers     = []
var yesterdayManeuvers = []
var quickDateFilter    = []

async function get_transporters(search_this_transporter)
{
    search_this_transporter = validateField(search_this_transporter) ? search_this_transporter : '' 
   
    return new Promise((resolve,reject) =>{
        /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-*/
        let data2Send = {'transporter_name':search_this_transporter}
        $.ajax({
            url:         API_URL+'/readTransporters',
            type:        'POST',
            contentType: 'application/json',
            data:         JSON.stringify(data2Send),
            success :     (function (data) 
            {
                if (data.message == '0') 
                {
                    resolve('0')
                }else
                {  
                   resolve(data.transportersFound); 
                }              
            }),

            error:function(serverResponse)
            {
                reject(-1)
            }
        })
        /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-*/
    })
}

async function get_clients()
{
    return new Promise((resolve,reject) =>{
        /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-*/
        $.ajax({
            url:      API_URL+'/client/readClients',
            type:     "GET",
            dataType: 'json',
            success : (function (data) 
            {
                if (data.message == '0') 
                {
                    resolve('0') 
                }else
                {  
                    resolve(data.client_names)
                }              
            }),

            error: function(serverResponse) 
            {   
                reject("-1")
            }
        })
        /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-*/
    })
}

async function getAllManeuversID()
{
    //LOADER...!
    display_loader(true)
    
    /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-*/
        $.ajax({
        url:      API_URL+'/man/getAllManeuvers',
        type:     "get",
        dataType: 'json',
        success : (function (data) 
        {
            if (data.message == '0') 
            {
                let notification_msg = ['¡No se han encontrado maniobras! ⛟ ','* Puede que no haya registrada ninguna maniobra.']
                display_notification('warning', notification_msg) 
            }else
            {  
                allManeuvers = data.objectsFound 
                
                /*
                for (let index = 0; index < allManeuvers.length; index++) 
                {
                    fillIDDashboard(allManeuvers[index])
                } */

                preloadFilterControls() 
                preloadHeaderFilter()

                actualPage = animationFunction.navigateToView('homePage','maneuversPage',false,'flex')
            }
        }),

        error: function(serverResponse) 
        {   
            let notification_msg = ['¡Servidor no responde! ⛟ ','* Hay un problema al conectar con el servidor.','* Contacta al administrador.']
            display_notification('error', notification_msg) 
        },

        complete: function() 
        {
            //Loader...!
            display_loader(false)
        }, 

        //async:false
    })
    /*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-*/

}

async function fillIDDashboard(parameters)
{
    // Step[1] - Display selected LOCATION & EVENTS when object created... 
    let selectedOptionFlag = ['','','','','','']
    let enabledOptions     = ''

    // Evaluate location to fill events SELECT CONTROL...
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

    // Step[2] - Display selected client and fill available remaining options...
    client_names = await get_clients()

    let display_clients = ''
    for (let index = 0; index < client_names.length; index++) 
    {
        display_clients = client_names[index] === parameters.man_cliente ? 
        display_clients += "<option selected value='"+client_names[index]+"'>"+client_names[index]+"</option>"
        :
        display_clients += "<option value='"+client_names[index]+"'>"+client_names[index]+"</option>"
    }

    // Step[3] - Display selected transport mode and fill available remaining options...
    let selected_mode   = ['','']
    switch (parameters.man_modalidad) 
    {
        case 'FULL':
            selected_mode[0] = 'selected'
        break;
        
        case 'SENCILLO':
            selected_mode[1] = 'selected'
        break;
    }


    // Step[4] - Display date of completed if available...    
    let isFinished = validateField(parameters.man_termino) ? parameters.man_termino : "Aún en curso"


    // Step[5] - Display selected TRANSPORTER and fill available remaining options...
    
    // Used without searching value to be able too get all objects...
    all_retrieved_transporters = await get_transporters('') 
    let display_transporters   = ''    
    for (let index = 0; index < all_retrieved_transporters.length; index++) 
    {
        display_transporters = all_retrieved_transporters[index].transporter_name === parameters.man_transportista ?
        display_transporters += "<option selected value='"+all_retrieved_transporters[index].transporter_name+"'>"+all_retrieved_transporters[index].transporter_name+"</option>"
        :
        display_transporters += "<option value='"+all_retrieved_transporters[index].transporter_name+"'>"+all_retrieved_transporters[index].transporter_name+"</option>"
    }
 
    // Step[6] - Display selected ECO and fill available remaining options...
    transporters = await get_transporters(parameters.man_transportista) 

    let display_ecos
    for (let index = 0; index < transporters[0].transporter_equipment.length; index++) 
    {
        display_ecos = transporters[0].transporter_equipment[index] === parameters.man_eco ?
        display_ecos += "<option selected value='"+transporters[0].transporter_equipment[index]+"'>"+transporters[0].transporter_equipment[index]+"</option>"
        :
        display_ecos += "<option value='"+transporters[0].transporter_equipment[index]+"'>"+transporters[0].transporter_equipment[index]+"</option>"
    }

    // Step[7] - Display selected OPERATOR and fill available remaining options...
    let display_operators
    for (let index = 0; index < transporters[0].transporter_operators.length; index++) 
    {
        //console.log(transporters[index].transporter_operators);   
        display_operators = transporters[0].transporter_operators[index] === parameters.man_eco ?
        display_operators += "<option selected value='"+transporters[0].transporter_operators[index]+"'>"+transporters[0].transporter_operators[index]+"</option>"
        :
        display_operators += "<option value='"+transporters[0].transporter_operators[index]+"'>"+transporters[0].transporter_operators[index]+"</option>"
    }

    // Step[8] - Process CONTAINERS data... 
    //Fill array with containers data...
    let containers_used = [ validateField(parameters.manCont_1_id)        ? (parameters.manCont_1_id != 'NO ASIGNADO' ? parameters.manCont_1_id        : '') : '',
                            validateField(parameters.manCont_1_size)      ? (parameters.manCont_1_size != '-'         ? parameters.manCont_1_size      : '') : '',  
                            validateField(parameters.manCont_1_peso)      ? (parameters.manCont_1_peso != '-'         ? parameters.manCont_1_peso      : '') : '',  
                            validateField(parameters.manCont_1_tipo)      ? (parameters.manCont_1_tipo != '-'         ? parameters.manCont_1_tipo      : '') : '',
                            validateField(parameters.manCont_1_contenido) ? (parameters.manCont_1_contenido != '-'    ? parameters.manCont_1_contenido : '') : '',
                            validateField(parameters.manCont_2_id)        ? (parameters.manCont_2_id != 'NO ASIGNADO' ? parameters.manCont_2_id        : '') : '',
                            validateField(parameters.manCont_2_size)      ? (parameters.manCont_2_size != '-'         ? parameters.manCont_2_size      : '') : '',  
                            validateField(parameters.manCont_2_peso)      ? (parameters.manCont_2_peso != '-'         ? parameters.manCont_2_peso      : '') : '',  
                            validateField(parameters.manCont_2_tipo)      ? (parameters.manCont_2_tipo != '-'         ? parameters.manCont_2_tipo      : '') : '',
                            validateField(parameters.manCont_2_contenido) ? (parameters.manCont_2_contenido != '-'    ? parameters.manCont_2_contenido : '') : '',
                            validateField(parameters.manCont_3_id)        ? (parameters.manCont_3_id != 'NO ASIGNADO' ? parameters.manCont_3_id        : '') : '',
                            validateField(parameters.manCont_3_size)      ? (parameters.manCont_3_size != '-'         ? parameters.manCont_3_size      : '') : '',  
                            validateField(parameters.manCont_3_peso)      ? (parameters.manCont_3_peso != '-'         ? parameters.manCont_3_peso      : '') : '',  
                            validateField(parameters.manCont_3_tipo)      ? (parameters.manCont_3_tipo != '-'         ? parameters.manCont_3_tipo      : '') : '',
                            validateField(parameters.manCont_3_contenido) ? (parameters.manCont_3_contenido != '-'    ? parameters.manCont_3_contenido : '') : '',
                            validateField(parameters.manCont_4_id)        ? (parameters.manCont_4_id != 'NO ASIGNADO' ? parameters.manCont_4_id        : '') : '',
                            validateField(parameters.manCont_4_size)      ? (parameters.manCont_4_size != '-'         ? parameters.manCont_4_size      : '') : '',  
                            validateField(parameters.manCont_4_peso)      ? (parameters.manCont_4_peso != '-'         ? parameters.manCont_4_peso      : '') : '',  
                            validateField(parameters.manCont_4_tipo)      ? (parameters.manCont_4_tipo != '-'         ? parameters.manCont_4_tipo      : '') : '',
                            validateField(parameters.manCont_4_contenido) ? (parameters.manCont_4_contenido != '-'    ? parameters.manCont_4_contenido : '') : '',
                          ]

    let set_container_class       = ['','','','']
    let display_container_size    = ['','','','']

     for (let index = 0; index < containers_used.length / 5; index++) 
    {
        //Means there is a valid container...
        if (validateField(containers_used[index * 5])) 
        {
            //set_container_class[index] = 'CLASS'
            switch (containers_used[index * 5 + 1]) 
            {
                case "20":
                    set_container_class[index] = (containers_used[index * 5  + 2]) > 20  && (containers_used[index * 5 + 2]) <= 26 ? 'bg_green_1000' : ((containers_used[index * 5 + 2]) > 26 ? 'bg_green_1000' : 'bg_green_1000')
                    display_container_size[index] = "<option selected value='20'>20</option><option value='40'>40</option><option value=''>SELECCIONA</option>"
                break;
            
                case "40":
                    set_container_class[index] = (containers_used[index * 5  + 2]) > 26  && (containers_used[index * 5 + 2]) <= 30 ? 'bg_green_1000' : ((containers_used[index * 5 + 2]) > 30 ? 'bg_green_1000' : 'bg_green_1000')
                    display_container_size[index] = "<option value='20'>20</option><option selected value='40'>40</option><option value=''>SELECCIONA</option>"
                break;

                case'':
                    set_container_class[index] = 'bg_green_1000'
                    display_container_size[index] = "<option selected value=''>SELECCIONA</option><option value='20'>20</option><option value='40'>40</option>"

                break;
            }
        }
        else //Means this one is not used...
        {
            set_container_class[index] = 'bg_green_1000'
            display_container_size[index] = "<option value=''>SELECCIONA</option><option value='20'>20</option><option value='40'>40</option>"
        }
    } 

    //To display GPS map if available...
    let display_gps_data = ['','']    

    if (parameters.man_gpsLink === 'SIN DATO ASIGNADO') 
    {
        display_gps_data[0]  = "<h3>MAPA NO DISPONIBLE POR EL MOMENTO</h3>"
        display_gps_data[1] = ""   
    } else 
    {
        display_gps_data[0] = "<embed src='"+parameters.man_gpsLink+"'>" ;
        display_gps_data[1] = "<a href="+parameters.man_gpsLink+" target='_blank' rel='noopener noreferrer'>PULSA PARA VER EN OTRA VENTANA</a>"   
    }

     

    let moniEnableStatus   = parameters.man_moni_enable  === 'true' ?  "checked" : ""


/*     $('#maneuvuers_scrollableContainer').append(
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
    ) */

    $('#maneuvuers_scrollableContainer').append(
    "<div class='maneuver_item'>"+
    "<div class='maneuver_top_row'>"+
    "<table class='maneuver_main_table'>"+
    "<tr>"+
    "<th class=''>%</th>"+
    "<th class=''>1ER CONTENEDOR</th>"+
    "<th class=''>ID MANIOBRA</th>"+
    "<th class=''>UBICACIÓN</th>"+
    "<th class=''>ESTATUS</th>"+
    "<th class=''>CLIENTE</th>"+
    "<th class=''>MODALIDAD</th>"+
    "<th class=''>F. DESPACHO</th>"+
    "<th class=''>F. TÉRMINO</th>"+
    "</tr>"+
    "<tr>"+
    "<td>"+parameters.maneuver_events[parameters.maneuver_events.length-1]+"</td>"+
    "<td>"+parameters.manCont_1_id+"</td>"+
    "<td class='folio_data'>"+parameters.man_folio+"</td>"+
    "<td>"+
    "<select class='tableData_location editable_field'>"+
    "<option value='SIN INICIAR' "+selectedOptionFlag[0]+">SIN INICIAR</option>"+
    "<option value='ASLA' "+selectedOptionFlag[1]+">ASLA</option>"+
    "<option value='EN RUTA' "+selectedOptionFlag[2]+">EN RUTA</option>"+
    "<option value='EN TERMINAL' "+selectedOptionFlag[3]+">EN TERMINAL</option>"+
    "<option value='RUTA FISCAL / MODULACIÓN' "+selectedOptionFlag[4]+">RUTA FISCAL / MODULACIÓN</option>"+
    "<option value='EN PATIO' "+selectedOptionFlag[5]+">EN PATIO</option>"+
    "</select>"+
    "</td>"+
    "<td>"+
    "<select class='tableData_status editable_field'>"+
    enabledOptions+
    "</select>"+
    "</td>"+
    "<td>"+
    "<select class='tableData_client editable_field'>"+
    //"<option value='"+parameters.man_cliente+"'>"+parameters.man_cliente+"</option>"+
    display_clients+
    "</select>"+
    "</td>"+
    "<td>"+
    "<select class='tableData_mode editable_field'>"+
    "<option value='FULL' "+selected_mode[0]+">FULL</option>"+
    "<option value='SENCILLO' "+selected_mode[1]+">SENCILLO</option>"+
    "</select>"+
    "</td>"+
    "<td><input type='datetime-local' class='tableData_start editable_field' value='"+parameters.man_despacho+"'></td>"+
    "<td>"+isFinished+"</td>"+
    "</tr>"+
    "</table>"+
    "<button class='expand_btn'>"+
    "<img src='img/nav_arrow_white.svg' alt='expand row arrow'>"+
    "</button>"+
    "</div>"+
    "<div class='collapsable_row expandable'>"+
    "<div class='maneuver_details_row '>"+
    "<div class='operative_details_container'>"+
    "<table class='man_general_details '>"+
    "<tr>"+
    "<th>TRANSPORTISTA</th>"+
    "<th>ECO</th>"+
    "<th>PLACAS</th>"+
    "<th>OPERADOR</th>"+
    "</tr>"+
    "<tr>"+
    "<td>"+
    "<select class='tableData_transporter editable_field'>"+
    //"<option value='"+parameters.man_transportista+"'>"+parameters.man_transportista+"</option>"+
    display_transporters+
    "</select>"+
    "</td>"+
    "<td>"+
    "<select class='tableData_eco editable_field'>"+
    //"<option value='"+parameters.man_eco+"'>"+parameters.man_eco+"</option>"+
    display_ecos+
    "</select>"+
    "</td>"+
    "<td class='tableData_placas'>"+parameters.man_placas+"</td>"+
    "<td>"+
    "<select class='tableData_operador editable_field'>"+
    //"<option value='"+parameters.man_operador+"'>"+parameters.man_operador+"</option>"+
    display_operators+
    "</select>"+
    "</td>"+
    "</tr>"+
    "</table>"+
    "</div>"+
    "<div class='general_details_container'>"+
    "<table class='man_general_details '>"+
    "<tr>"+
    "<th>A. ADUANAL</th>"+
    "<th>EJECUTIVA</th>"+
    "<th>CAAT</th>"+
    "<th>TERMINAL DE CARGA</th>"+
    "<th>PATIO DE DESCARGA</th>"+
    "<th>BLOQUE TURNO</th>"+
    "</tr>"+
    "<tr>"+
    "<td><input type='text'  class='tableData_aa editable_field' value='"+parameters.man_aa+"'></td>"+
    "<td><input type='text'  class='tableData_ejecutiva editable_field' value='"+parameters.man_ejecutiva+"'></td>"+
    "<td><input type='text'  class='tableData_caat editable_field' value='"+parameters.man_caat+"'></td>"+
    "<td><input type='text'  class='tableData_terminal editable_field' value='"+parameters.man_terminal+"'></td>"+
    "<td><input type='text'  class='tableData_descarga editable_field' value='"+parameters.man_descarga+"'></td>"+
    "<td>"+parameters.man_despacho+"</td>"+
    "</tr>"+
    "</table>"+
    "</div>"+
    "<div class='maneuver_middle_row'>"+
    "<div class='maneuver_containers'>"+
    "<div class='container_unit "+set_container_class[0]+"'>"+
    "<p><input type='text' class='cu_id cu_id_1 control' value = '"+parameters.manCont_1_id+"'></p>"+
    "<div class='container_unit_row'>"+
    "<p>TAMAÑO (Ft.)</p>"+
    "<select class='cu_input c1_size control'>"+
    display_container_size[0]+
    "</select>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>PESO (Tons.)</p>"+
    "<input type='number' min='0' class='cu_input c1_weight control' value = '"+parameters.manCont_1_peso+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>TIPO</p>"+
    "<input type='text' class='cu_input c1_type control' value = '"+parameters.manCont_1_tipo+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>CONTENIDO</p>"+
    "<input type='text' class='cu_input c1_content control' value = '"+parameters.manCont_1_contenido+"'>"+
    "</div>"+
    "</div>"+
    "<div class='container_unit "+set_container_class[1]+"'>"+
    "<p><input type='text' class='cu_id cu_id_2 control' value = '"+parameters.manCont_2_id+"'></p>"+
    "<div class='container_unit_row'>"+
    "<p>TAMAÑO (Ft.)</p>"+
    "<select class='cu_input c2_size control'>"+
    display_container_size[1]+
    "</select>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>PESO (Tons.)</p>"+
    "<input type='number' min='0' class='cu_input c2_weight control' value = '"+parameters.manCont_2_peso+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>TIPO</p>"+
    "<input type='text' class='cu_input c2_type control' value = '"+parameters.manCont_2_tipo+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>CONTENIDO</p>"+
    "<input type='text' class='cu_input c2_content control' value = '"+parameters.manCont_2_contenido+"'>"+
    "</div>"+
    "</div>"+
    "<div class='container_unit "+set_container_class[2]+"'>"+
    "<p><input type='text' class='cu_id cu_id_3 control' value = '"+parameters.manCont_3_id+"'></p>"+
    "<div class='container_unit_row'>"+
    "<p>TAMAÑO (Ft.)</p>"+
    "<select class='cu_input c3_size control'>"+
    display_container_size[2]+
    "</select>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>PESO (Tons.)</p>"+
    "<input type='number' min='0' class='cu_input c3_weight control' value = '"+parameters.manCont_3_peso+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>TIPO</p>"+
    "<input type='text' class='cu_input c3_type control' value = '"+parameters.manCont_3_tipo+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>CONTENIDO</p>"+
    "<input type='text' class='cu_input c3_content control' value = '"+parameters.manCont_3_contenido+"'>"+
    "</div>"+
    "</div>"+
    "<div class='container_unit "+set_container_class[3]+"'>"+
    "<p><input type='text' class='cu_id cu_id_4 control' value = '"+parameters.manCont_4_id+"'></p>"+
    "<div class='container_unit_row'>"+
    "<p>TAMAÑO (Ft.)</p>"+
    "<select class='cu_input c4_size control'>"+
    display_container_size[3]+
    "</select>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>PESO (Tons.)</p>"+
    "<input type='number' min='0' class='cu_input c4_weight control' value = '"+parameters.manCont_3_peso+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>TIPO</p>"+
    "<input type='text' class='cu_input c4_type control' value = '"+parameters.manCont_4_tipo+"'>"+
    "</div>"+
    "<div class='container_unit_row'>"+
    "<p>CONTENIDO</p>"+
    "<input type='text' class='cu_input c4_content control' value = '"+parameters.manCont_4_contenido+"'>"+
    "</div>"+
    "</div>"+
    "</div>"+
    "<div class='maneuver_options'>"+
    "<button class='mo_btn control_btn'>"+
    "<img src='img/delete_red.svg'>"+
    "</button>"+
    //"<input type='checkbox' class='enable_monitor' "+parameters.monitor_enabled+">"+
    "<input type='checkbox' class='enable_monitor' "+moniEnableStatus+">"+
    "</div>"+
    "</div>"+
    "<div class='note_container'>"+
    "<textarea  class='note control' placeholder='Aquí puedes agregar anotaciones...' >"+parameters.man_note+"</textarea>"+
    "<button class='mo_btn control_btn'>"+
    "<img src='img/editar.svg'>"+
    "</button>"+
    "</div>"+
    "<div class='tracking_container'>"+
    "<div class='timeline_container'>"+
    fillTimeline(parameters)+
/*     "<div class='timeline_item left'>"+
    "<div class='timeline_item_data'>"+
    "<h4>EVENT TIME</h4>"+
    "<P>###%</P>"+
    "<P>EVENT LOCATION</P>"+
    "<P>EVENT STATUS</P>"+
    "</div>"+
    "</div>"+
    "<div class='timeline_item right'>"+
    "<div class='timeline_item_data'>"+
    "<h4>EVENT TIME</h4>"+
    "<P>###%</P>"+
    "<P>EVENT LOCATION</P>"+
    "<P>EVENT STATUS</P>"+
    "</div>"+
    "</div>"+
    "<div class='timeline_item left'>"+
    "<div class='timeline_item_data'>"+
    "<h4>EVENT TIME</h4>"+
    "<P>###%</P>"+
    "<P>EVENT LOCATION</P>"+
    "<P>EVENT STATUS</P>"+
    "</div>"+
    "</div>"+
    "<div class='timeline_item right'>"+
    "<div class='timeline_item_data'>"+
    "<h4>EVENT TIME</h4>"+
    "<P>###%</P>"+
    "<P>EVENT LOCATION</P>"+
    "<P>EVENT STATUS</P>"+
    "</div>"+
    "</div>"+ */
    "</div>"+
    "<div class='gps_container'>"+
    "<div class='gps_controls '>"+
    "<input type='text' class='gps_update_input control'>"+
    "<button class='gps_btn control_btn'>"+
    "<img src='img/ubicacion_orange.svg'>"+
    "</button>"+
    "</div>"+
    "<div class='gps_map'>"+
    //"<embed src='"+parameters.man_gpsLink+"'>"+
    display_gps_data[0]+
    "</div>"+
    //"<a href='http://'>PULSA PARA VER EN OTRA VENTANA</a>"+
    display_gps_data[1]+
    "</div>"+
    "</div>"+
    "</div>"+
    "</div>"+
    "</div>"
    )
}

function fillTimeline(maneuver_events)
{
    let tl_content = ''
    let tl_class   = ''

    //FORWARD...
    /* for (let index = 0; index < (maneuver_events.maneuver_events.length / 4); index++) 
    {
        tl_class = index % 2 === 0 ? "left" : "right" 

        tl_content+="<div class='timeline_item "+tl_class+"'>"+
        "<div class='timeline_item_data'>"+
        "<h4>"+maneuver_events.maneuver_events[index*4]+"</h4>"+
        "<P>"+maneuver_events.maneuver_events[index*4+3]+"</P>"+
        "<P>"+maneuver_events.maneuver_events[index*4+1]+"</P>"+
        "<P>"+maneuver_events.maneuver_events[index*4+2]+"</P>"+
        "</div>"+
        "</div>"
    } */

    //BACKWARD...
    for (let index = maneuver_events.maneuver_events.length / 4; index > 0; index--) 
    {
        if ((maneuver_events.maneuver_events.length / 4) % 2 === 0) 
        {
            tl_class = index % 2 === 0 ? "left" : "right" 
        } else 
        {
            tl_class = index % 2 === 0 ? "right" : "left" 
        }

        tl_content+="<div class='timeline_item "+tl_class+"'>"+
        "<div class='timeline_item_data'>"+
        "<h4>"+maneuver_events.maneuver_events[index*4 - 4]+"</h4>"+
        "<P>"+maneuver_events.maneuver_events[index*4 - 3]+"</P>"+
        "<P>"+maneuver_events.maneuver_events[index*4 - 1]+"</P>"+
        "<P>"+maneuver_events.maneuver_events[index*4 - 2]+"</P>"+
        "</div>"+
        "</div>"
    }

    return tl_content
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

function preloadHeaderFilter()
{
    $('.hf_check').prop('checked',false)
    resetForm('controls_container')

        /** - Step [1]
     *  - Define bounds and zeroing time to iterate only by date...!
     */
    const today = new Date()
    today.setHours(0,0,0,0)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate()-1)
    yesterday.setHours(0,0,0,0)

    todayManeuvers     = []
    yesterdayManeuvers = []

    /** - Step [2]
     *  - Fill filtered arrays to display...
     */
    allManeuvers.forEach(maneuver => 
    {
        const maneuver_last_update = new Date (maneuver.maneuver_update_date)
        maneuver_last_update.setHours(0,0,0,0)

        if (maneuver_last_update.toDateString() === today.toDateString()) { todayManeuvers.push(maneuver) }          // Only this part is taken as STRING for comparison...
        if (maneuver_last_update < today && maneuver_last_update >= yesterday) { yesterdayManeuvers.push(maneuver) } // Normal DATE object comparison...
    })

    /** - Step [3] 
     *  - On view load display filtered according to condition...
     */
    $('#maneuvuers_scrollableContainer').empty()
    if (todayManeuvers.length >= 1) 
    {
        let notification_msg = ['Mostrando maniobras del día de hoy ⛟ ','* Encontramos maniobras que se actualizaron hoy como más recientes primero.']
        display_notification('ok', notification_msg) 
        
        for (let index = 0; index < todayManeuvers.length; index++) 
        {
            fillIDDashboard(todayManeuvers[index])    
        }
    }else
    {
        if (yesterdayManeuvers.length >= 1) 
        {
            let notification_msg = ['Mostrando maniobras del día de ayer ⛟ ','* Encontramos maniobras que se actualizaron ayer como más recientes primero.']
            display_notification('ok', notification_msg) 
            for (let index = 0; index < yesterdayManeuvers.length; index++) 
            {
                fillIDDashboard(yesterdayManeuvers[index])    
            } 
        } else 
        {
            let notification_msg = ['Mostrando todas las maniobras ⛟ ','* No encontramos maniobras actualizadas hoy.','* No encontramos maniobras actualizadas ayer.','* Mostrando todas las maniobras.']
            display_notification('ok', notification_msg) 
            for (let index = 0; index < allManeuvers.length; index++) 
            {
                fillIDDashboard(allManeuvers[index])    
            } 
        }
    }

}

//TOGGLE change filter events...
$('.header_filter').on('change','.hf_check', (e)=>
{
    let value = $(e.target).closest('.header_filter').find('.hf_check')

    $('#maneuvuers_scrollableContainer').empty()

    if (value[0].checked) 
    {
        if (yesterdayManeuvers.length <= 0) 
        {
            let notification_msg = ['¡Ninguna maniobra fue actualizada ayer! ⛟ ','* No hay maniobras actualizadas con fecha del día de ayer.','* Se mostrarán todas las maniobras']
            display_notification('warning', notification_msg) 

            for (let index = 0; index < allManeuvers.length; index++) 
            {
                fillIDDashboard(allManeuvers[index])    
            } 
        }else
        {
            for (let index = 0; index < yesterdayManeuvers.length; index++) 
            {
                fillIDDashboard(yesterdayManeuvers[index])    
            } 
        }
    } else 
    {
        console.log(todayManeuvers);
        if (todayManeuvers.length <= 0) 
        {
            let notification_msg = ['¡Ninguna maniobra fue actualizada hoy! ⛟ ','* No hay maniobras actualizadas con fecha del día de hoy.','* Se mostrarán todas las maniobras']
            display_notification('warning', notification_msg) 

            for (let index = 0; index < allManeuvers.length; index++) 
            {
                fillIDDashboard(allManeuvers[index])    
            } 
        }else
        {
            for (let index = 0; index < todayManeuvers.length; index++) 
            {
                fillIDDashboard(todayManeuvers[index])    
            } 
        }
    }

    resetForm('controls_container')
})

// Clean HEADER FILTER date field...
$('.header_filter').on('click','.input_clear', (e)=>
{
    $(e.target).closest('.input_container').find('.hf_entry').val('')
})

//
$('.header_filter').on('change','.hf_entry', (e)=>
{
    quickDateFilter = []

    const start_search_date = $('.hf_start').val()
    console.log(start_search_date);
    
    const end_search_date = $('.hf_end').val()
    console.log(end_search_date);

    if (validateField(start_search_date) && validateField(end_search_date)) 
    {   
        const from_this_date = new Date(start_search_date)
        from_this_date.setHours(0,0,0,0)

        const to_this_date = new Date(end_search_date)
        to_this_date.setHours(0,0,0,0)

        if (to_this_date > from_this_date) 
        {
            console.log('Dates are valid... Apply filter');
            allManeuvers.forEach(maneuver => 
            {
                const maneuver_last_update = new Date(maneuver.maneuver_update_date)
                if (maneuver_last_update >= from_this_date && maneuver_last_update <= to_this_date) { quickDateFilter.push(maneuver) }  
            });

                    console.log(quickDateFilter);
            $('#maneuvuers_scrollableContainer').empty()
            let notification_msg = ['Mostrando maniobras encontradaas ⛟ ','* Encontramos maniobras que se actualizaron dentro del rango de fechas.']
            display_notification('ok', notification_msg) 
            for (let index = 0; index < quickDateFilter.length; index++) 
            {
                fillIDDashboard(quickDateFilter[index])    
            } 
        }else
        {
            let notification_msg = ['¡Rangos de fecha no válido! ⛟ ','* Revisa que la fecha final sea posterior a la inicial.']
            display_notification('warning', notification_msg) 
        }


    }

})


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

    const availableFilters  = [
        'folio_filter',
        'placas_filter',
        'contedores_filter',
        'cliente_filter',
        'transportista_filter',
        'operador_filter',
        'finished_filter',
        'from_date_filter',
        'until_date_filter'
    ]
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
        //console.log(containersID_search);
        
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
$('#maneuvuers_scrollableContainer').on('change','.enable_monitors',(e)=>
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
$('#maneuvuers_scrollableContainer').on('change','.editable_field', (e)=> 
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
/* 
    let man_folio = $(e.target).closest('.maneuverContainer')
    .find('.mainRow')
    .find('.briefingTable')
    .find('.tableData')
    .find('.tableData_folio').text(); */

    let man_folio = $(e.target).closest('.maneuver_item')
    .find('.maneuver_top_row')
    .find('.maneuver_main_table')
    .find('.folio_data').text();

    //console.log(man_folio);

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
    
/* 
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
    })   */
});

// ⚑ Change EVENTS select control according to LOCATION select control...
$('#maneuvuers_scrollableContainer').on('change','.tableData_location', (e)=> 
{
    let selectedLocation = $(e.target).closest('.maneuver_item')
    .find('.maneuver_top_row')
    .find('.maneuver_main_table')
    .find('.tableData_location').val();

    switch (selectedLocation) 
    {
        case 'SIN INICIAR':
            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').empty();
        break;
    
        case 'ASLA':
            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').empty()

            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='EN ESPERA'>EN ESPERA</option>"+
                "<option value='LLAMADO'>LLAMADO</option>"+
                "<option value='CANCELADO'>CANCELADO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'EN RUTA':
            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').empty()

            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='EN RUTA A TERMINAL'>EN RUTA A TERMINAL</option>"+
                "<option value='EN RUTA A PATIO'>EN RUTA A PATIO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'EN TERMINAL':
            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').empty()

            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='ESPERANDO A SER CARGADO'>ESPERANDO A SER CARGADO</option>"+
                "<option value='CARGADO'>CARGADO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'RUTA FISCAL / MODULACIÓN':
            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').empty()

            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='SIN MODULAR'>SIN MODULAR</option>"+
                "<option value='VERDE'>VERDE</option>"+
                "<option value='AMARILLO'>AMARILLO</option>"+
                "<option value='ROJO'>ROJO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;

        case 'EN PATIO':
            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').empty()

            $(e.target).closest('.maneuver_item')
            .find('.maneuver_top_row')
            .find('.maneuver_main_table')
            .find('.tableData_status').append(
                "<option value=''>SELECCIONAR</option>"+
                "<option value='ESPERANDO A SER DESCARGADO'>ESPERANDO A SER DESCARGADO</option>"+
                "<option value='FINALIZADO'>FINALIZADO</option>"+
                "<option value='EVENTO EXTRA'>EVENTO EXTRA</option>")
        break;
    }
});

// ⚑ Change DEPENDANDT select control values according to TRANSPORTER select control...
$('#maneuvuers_scrollableContainer').on('change','.tableData_transporter', (e)=> 
{
    // Step[1] -  Get master value for dependant values...
    let selected_transporter = $(e.target).closest('.maneuver_item')
    .find('.collapsable_row')
    .find('.maneuver_details_row')
    .find('.operative_details_container')
    .find('.tableData_transporter').val();

    // Step[2] - Get actual master value from all transporters...
    let found_master_object = all_retrieved_transporters.find(({transporter_name}) => transporter_name === selected_transporter)

    // Step[3] - Clear all select control options and execute function to build all remaining options...
    //ECO...
    $(e.target).closest('.maneuver_item')
    .find('.collapsable_row')
    .find('.maneuver_details_row')
    .find('.operative_details_container')
    .find('.tableData_eco').empty();

    $(e.target).closest('.maneuver_item')
    .find('.collapsable_row')
    .find('.maneuver_details_row')
    .find('.operative_details_container')
    .find('.tableData_eco').append(build_select_options(found_master_object.transporter_equipment));

    //PLATES...
    $(e.target).closest('.maneuver_item')
    .find('.collapsable_row')
    .find('.maneuver_details_row')
    .find('.operative_details_container')
    .find('.tableData_placas').text("");

    //OPERATOR...
    $(e.target).closest('.maneuver_item')
    .find('.collapsable_row')
    .find('.maneuver_details_row')
    .find('.operative_details_container')
    .find('.tableData_operador').empty();

    $(e.target).closest('.maneuver_item')
    .find('.collapsable_row')
    .find('.maneuver_details_row')
    .find('.operative_details_container')
    .find('.tableData_operador').append(build_select_options(found_master_object.transporter_operators));

});

function update_maneuvers() 
{
    let objects_to_save = []

    // Step [1] - Get input values from UI...
    $('.maneuver_item').each(function ()
    {
        let updated_object = {}

        // Main row data...
        let maneuver_id = $(this).find('.maneuver_top_row')
        .find('.maneuver_main_table')
        .find('.folio_data').text()
     
        let new_location = $(this).find('.maneuver_top_row')
        .find('.maneuver_main_table')
        .find('.tableData_location').val()
          
        let new_status = $(this).find('.maneuver_top_row')
        .find('.maneuver_main_table')
        .find('.tableData_status').val()

        validateField(new_status) ? new_status = new_status : new_status = 'SIN INICIAR'
     
        let new_client = $(this).find('.maneuver_top_row')
        .find('.maneuver_main_table')
        .find('.tableData_client').val()

        let new_mode = $(this).find('.maneuver_top_row')
        .find('.maneuver_main_table')
        .find('.tableData_mode').val()

        let new_start_date = $(this).find('.maneuver_top_row')
        .find('.maneuver_main_table')
        .find('.tableData_start').val()

        // Transporter data...
        let new_transporter = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.operative_details_container')
        .find('.tableData_transporter').val();

        let new_eco = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.operative_details_container')
        .find('.tableData_eco').val();

        let new_operator = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.operative_details_container')
        .find('.tableData_operador').val();

        // General data...
        let new_aa = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.general_details_container')
        .find('.tableData_aa').val();

        validateField(new_aa) ? new_aa = new_aa : new_aa = 'SIN ASIGNAR'

        let new_executive = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.general_details_container')
        .find('.tableData_ejecutiva').val();

        validateField(new_executive) ? new_executive = new_executive : new_executive = 'SIN ASIGNAR'

        let new_caat = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.general_details_container')
        .find('.tableData_caat').val();

        validateField(new_caat) ? new_caat = new_caat : new_caat = 'SIN ASIGNAR'

        let new_terminal = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.general_details_container')
        .find('.tableData_terminal').val();

        validateField(new_terminal) ? new_terminal = new_terminal : new_terminal = 'SIN ASIGNAR'

        let new_unload = $(this).find('.collapsable_row')
        .find('.maneuver_details_row')
        .find('.general_details_container')
        .find('.tableData_descarga').val();

        validateField(new_unload) ? new_unload = new_unload : new_unload = 'SIN ASIGNAR'

        // Containers data...
        let new_container_1 = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.cu_id_1').val();

        validateField(new_container_1) ? new_container_1 = new_container_1 : new_container_1 = ''

        let new_container_1_size = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c1_size').val();

        validateField(new_container_1_size) ? new_container_1_size = new_container_1_size : new_container_1_size = ''

        let new_container_1_weight = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c1_weight').val();

        validateField(new_container_1_weight) ? new_container_1_weight = new_container_1_weight : new_container_1_weight = ''

        let new_container_1_type = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c1_type').val();

        validateField(new_container_1_type) ? new_container_1_type = new_container_1_type : new_container_1_type = ''

        let new_container_1_content = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c1_content').val();

        validateField(new_container_1_content) ? new_container_1_content = new_container_1_content : new_container_1_content = ''
        
        let new_container_2 = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.cu_id_2').val();

        validateField(new_container_2) ? new_container_2 = new_container_2 : new_container_2 = ''

        let new_container_2_size = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c2_size').val();

        validateField(new_container_2_size) ? new_container_2_size = new_container_2_size : new_container_2_size = ''

        let new_container_2_weight = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c2_weight').val();

        validateField(new_container_2_weight) ? new_container_2_weight = new_container_2_weight : new_container_2_weight = ''

        let new_container_2_type = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c2_type').val();

        validateField(new_container_2_type) ? new_container_2_type = new_container_2_type : new_container_2_type = ''

        let new_container_2_content = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c2_content').val();

        validateField(new_container_2_content) ? new_container_2_content = new_container_2_content : new_container_2_content = ''

        let new_container_3 = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.cu_id_3').val();

        validateField(new_container_3) ? new_container_3 = new_container_3 : new_container_3 = ''

        let new_container_3_size = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c3_size').val();

        validateField(new_container_3_size) ? new_container_3_size = new_container_3_size : new_container_3_size = ''

        let new_container_3_weight = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c3_weight').val();

        validateField(new_container_3_weight) ? new_container_3_weight = new_container_3_weight : new_container_3_weight = ''

        let new_container_3_type = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c3_type').val();

        validateField(new_container_3_type) ? new_container_3_type = new_container_3_type : new_container_3_type = ''

        let new_container_3_content = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c3_content').val();

        validateField(new_container_3_content) ? new_container_3_content = new_container_3_content : new_container_3_content = ''

        let new_container_4 = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.cu_id_4').val();

        validateField(new_container_4) ? new_container_4 = new_container_4 : new_container_4 = ''

        let new_container_4_size = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c4_size').val();

        validateField(new_container_4_size) ? new_container_4_size = new_container_4_size : new_container_4_size = ''

        let new_container_4_weight = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c4_weight').val();

        validateField(new_container_4_weight) ? new_container_4_weight = new_container_4_weight : new_container_4_weight = ''

        let new_container_4_type = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c4_type').val();

        validateField(new_container_4_type) ? new_container_4_type = new_container_4_type : new_container_4_type = ''

        let new_container_4_content = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.maneuver_containers')
        .find('.c4_content').val();

        validateField(new_container_4_content) ? new_container_4_content = new_container_4_content : new_container_4_content = ''

        // Get VISIBLE check status...
        let enable_moni = $(this).find('.collapsable_row')
        .find('.maneuver_middle_row')
        .find('.enable_monitor')

        let is_active = enable_moni.is(':checked') ? 'true':'false'

        // Get note value...
        let new_note = $(this).find('.collapsable_row')
        .find('.note_container')
        .find('.note').val();

        // Get GPS new link value...
        let new_gps_link = $(this).find('.collapsable_row')
        .find('.tracking_container')
        .find('.gps_container')
        .find('.gps_controls')
        .find('.gps_update_input').val();
      
        // Step [2] - Build new object to be sent to the server...
        updated_object.man_folio                 = maneuver_id             
        updated_object.maneuver_current_location = new_location
        updated_object.maneuver_current_status   = new_status
        updated_object.man_cliente               = new_client
        updated_object.man_modalidad             = new_mode
        updated_object.man_despacho              = new_start_date
        updated_object.man_transportista         = new_transporter
        updated_object.man_eco                   = new_eco
        updated_object.man_operador              = new_operator
        updated_object.man_aa                    = new_aa
        updated_object.man_ejecutiva             = new_executive
        updated_object.man_caat                  = new_caat
        updated_object.man_terminal              = new_terminal
        updated_object.man_descarga              = new_unload
        updated_object.manCont_1_id             = new_container_1
        updated_object.manCont_1_size           = new_container_1_size
        updated_object.manCont_1_peso           = new_container_1_weight
        updated_object.manCont_1_tipo           = new_container_1_type
        updated_object.manCont_1_contenido      = new_container_1_content
        updated_object.manCont_2_id             = new_container_2
        updated_object.manCont_2_size           = new_container_2_size
        updated_object.manCont_2_peso           = new_container_2_weight
        updated_object.manCont_2_tipo           = new_container_2_type
        updated_object.manCont_2_contenido      = new_container_2_content
        updated_object.manCont_3_id             = new_container_3
        updated_object.manCont_3_size           = new_container_3_size
        updated_object.manCont_3_peso           = new_container_3_weight
        updated_object.manCont_3_tipo           = new_container_3_type
        updated_object.manCont_3_contenido      = new_container_3_content
        updated_object.manCont_4_id             = new_container_4
        updated_object.manCont_4_size           = new_container_4_size
        updated_object.manCont_4_peso           = new_container_4_weight
        updated_object.manCont_4_tipo           = new_container_4_type
        updated_object.manCont_4_contenido      = new_container_4_content
        updated_object.man_moni_enable           = is_active
        updated_object.man_note                  = new_note
        updated_object.man_gpsLink               = new_gps_link

        objects_to_save.push(updated_object)
    })

    //console.log(objects_to_save);

    $.ajax({
                    url: API_URL+'/man/updateManeuvers',
                    type: "patch",
                    contentType: "application/json",
                    data: JSON.stringify({
                        objects_to_save
                    }),
                    //data: {objects_to_save},
                    success : (function (data) 
                    {
                       //console.log(data);
                        $('#maneuvuers_scrollableContainer').empty()
                       getAllManeuversID()
                        //actualPage = animationFunction.navigateToView('maneuversPage','maneuversPage',false,'flex')
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

    //console.log(allManeuvers);
}




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

//Used to display a mesagge pop-up...
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
            $('.notify_img').append('<img src="img/ok_white.svg">')
        break;
    
        case 'error':
            $('.notify_container').addClass('notify_error')
            $('.notify_img').append('<img src="img/error_white.svg">')
        break;

        case 'warning':
            $('.notify_container').addClass('notify_warning')
            $('.notify_img').append('<img src="img/warning_white.svg">')
        break;
    }
}

$('#close_notify').click(function() { $('.notify_pop_up').fadeOut(200) })

//Used to display / hide loader...
function display_loader(display)
{
    if (display) 
    {
        $('#truck_loader').css('display','flex').hide().fadeIn(200);
        animationFunction.animateTruck(true)
    }else 
    {
        $('#truck_loader').fadeOut(500)
        animationFunction.animateTruck(false)
    }
}

// Used to build all HTML SELECT CONTROL options dinamically...
function build_select_options(master_object,custom_default) 
{
    let built_options
   
    if (custom_default) 
    {
        built_options = custom_default
    }else
    {
        built_options = '<option value="">SELECCIONA</option>'
    }

    if (master_object!= '0' || master_object != 0) 
    {
        master_object.forEach(element => { built_options += "<option value='"+element+"'>"+element+"</option>" });    
    }

    return built_options
}

function timeSnapshot(fullDateTime)
{
    const dateTime = new Date()

    const day     = dateTime.getDate() < 10 ? '0' + dateTime.getDate() : dateTime.getDate() 
    const month   = dateTime.toLocaleString('es-mx',{month:'long'}).toUpperCase()
    const year    = dateTime.getFullYear()
    const hours   = dateTime.getHours()   < 10 ? "0" + dateTime.getHours()   : dateTime.getHours()
    const minutes = dateTime.getMinutes() < 10 ? "0" + dateTime.getMinutes() : dateTime.getMinutes()
    const seconds = dateTime.getSeconds() < 10 ? "0" + dateTime.getSeconds() : dateTime.getSeconds()

    let timeSnapshot

    fullDateTime ? timeSnapshot = day +"-"+month+"-"+year+"  "+hours+":"+minutes+":"+seconds : timeSnapshot = day +"-"+month+"-"+year

    return timeSnapshot
}
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
/* function fillTimeline(eventTime,eventLocation,eventStatus,eventPercentage,completed)
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


} */


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
