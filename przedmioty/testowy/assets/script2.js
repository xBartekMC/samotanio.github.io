jQuery(document).ready(function(){

	$ = jQuery;
	var ajax_url = SITEURL + '/ajax/ajax.php';
		
	$('.redirect').click(function(){
		$(location).attr('href', $(this).data('redirect'));
	});
	$("input[name*='q']").change(function() {
		$("input[name*='quantity']").val($("input[name*='q']").val());
	});
		
	$("select[name*='variants']").change(function() {
		ajax = true;
		var productstatus = $("span#productstatus");
		var form = $("form.productpage.variants.form");
		$("select[name*='variants']").each(function(index) {
			if($(this).val() == 0) ajax = false;
		});
		
		if(ajax)
		{
			$.ajax({
				type:'POST',
				url:ajax_url,
				data:form.serialize(),
				success:function(response){
					var json = $.parseJSON(response);		
					if(json.quantity > 0)
					{
						productstatus.css('color', 'green');
						productstatus.html('<i class="fa fa-smile-o"></i> Produkt dostępny');
						$("input[name='productid']").attr('value', json.id);
						$(".first.item-image img").attr('src', json.img_preview);
						$(".woocommerce-main-image.zoom.first").attr('href', json.img_preview);
						$(".woocommerce-main-image.zoom.first img").attr('src', json.img_preview);
						$("button.addtocart").attr("disabled",false).attr('title', 'Dodaj produkt do koszyka').html('Dodaj produkt do koszyka').removeClass('disabled');
					}
					else
					{
						productstatus.css('color', 'red');
						productstatus.html('<i class="fa fa-exclamation-circle"></i> Produkt niedostępny');
						$("input[name='productid']").attr('value', '');
						$(".first.item-image img").attr('src', json.img_preview);
						$(".woocommerce-main-image.zoom.first").attr('href', json.img_preview);
						$(".woocommerce-main-image.zoom.first img").attr('src', json.img_preview);
						$("button.addtocart").attr("disabled",true).attr('title', 'Produkt niedostępny').html('Dodaj produkt do koszyka').addClass('disabled');
					}
				},
				complete:function(){
				}
			});
		}
		else
		{
			productstatus.css('color', 'red');
			productstatus.html('<i class="fa fa-hand-o-up"></i> Wybierz warianty');
			$("input[name='productid']").attr('value', '');
			$("button.addtocart").attr("disabled",true).attr('title', 'Wybierz warianty').html('Dodaj produkt do koszyka').addClass('disabled');
		}
	});
	
	$('body').on('keyup', 'form .input-required input', function(e) {
		if(!$(this).val())
		{
			$(this).closest('.input-required').removeClass('has-ok').addClass( "has-error" );
		}
		else
		{
			$(this).closest('.input-required').removeClass( "has-error" ).addClass('has-ok');
		}
	});
	
	$('body').on('change', '.woocommerce-checkout-payment input[name="shipping_id"], .woocommerce-checkout-payment input[name="gateway_id"]', function(e) {
	
		var form = $('form.order-form');
		
		/*$('html, body').animate({
			scrollTop: $('.sekcja-podsumowanie-prawa-strona-p').offset().top
		}, 500);
		
		*/
		
		var thisradio = this;
		
		$.ajax({
			type: "post",
			dataType: 'json',
			url: ajax_url,
			data:form.serialize(),
			beforeSend: function() {
				$('.col-md-5').block({ message: null });
			},
			success: function(json) {
				
				if(json.type == "notice")
				{
		
					var shippingprice = $("shipping").data('s');
					var gatewayprice = $("shipping").data('g');
					var totalvalue = $("totalamount").data('total') - shippingprice - gatewayprice;
					
					if($(thisradio).attr('name') == 'shipping_id')
					{
						$("shipping").data('s', $(thisradio).data('price'));
						$("div.shipping_box").hide();
						$("div.shipping_box_" + $(thisradio).val()).slideDown(250);
					}
					else if($(thisradio).attr('name') == 'gateway_id')
					{
						$("shipping").data('g', $(thisradio).data('price'));
						$("div.payment_box").hide();
						$("div.payment_box_" + $(thisradio).val()).slideDown(250);
					}
					
					var shippingprice = $("shipping").data('s');
					var gatewayprice = $("shipping").data('g');
					var totalshipping = parseFloat(shippingprice) + parseFloat(gatewayprice);
					
					var newtotalvalue = parseFloat(totalvalue) + parseFloat(totalshipping);
					var newshippingtext = parseFloat(parseFloat(shippingprice) + parseFloat(gatewayprice)).toFixed(2).replace('.', ',') + ' zł';
					var newtotaltext = parseFloat(newtotalvalue).toFixed(2).replace('.', ',') + ' zł';
					$("totalamount").data('total', (parseFloat(newtotalvalue).toFixed(2)));
					$("shipping").text(newshippingtext);
					$("totalamount").text(newtotaltext);
					$("vat").text(parseFloat(reduceVat(parseFloat(newtotalvalue)).toFixed(2)) + ' zł');
					
					$.growl.notice({ message: json.message });
					//$(".ajaxmsg").html('');
					if(json.ajaxshippings)
					{
						$('html, body').animate({
							scrollTop: $('.ajaxshippings').offset().top
						}, 500);
					}
					else if(json.ajaxgateways)
					{
						/*$('html, body').animate({
							scrollTop: $('.ajaxgateways').offset().top
						}, 500);
						*/
					}
					else
					{
						$('input[name="validateNewOrder"]').attr('name', 'processNewOrder');
						$.ajax({
							type: "post",
							url: ajax_url,
							data: form.serialize(),
							success: function (msg) {
								$(".ajaxmsg").html(msg);
								$(".ajaxmsg").closest('.place-order').fadeIn();
								$('input[name="processNewOrder"]').attr('name', 'validateNewOrder');
								
							}
						});
					}
				}
				else if(json.type == "error")
				{
					$.growl.error({ message: json.message });
					$(thisradio).attr('checked', false);
					$(thisradio).prop('checked', false);
		
					//$('.ajaxmsg').html('');
				}
				$('.col-md-5').unblock();

			}
		});
			
		
	});
	
	function reduceVat(amount)
	{
		return amount * 0.23;
	}
	
	/* == Cart Functions == */
	$('body').on('click', 'button.addtocart', function(e) {
		e.preventDefault();
		var form = $(".variations_form.cart");
		var pid = $("input[name='productid']").val();
		var cart_text = $("cart");
		if(pid != null)
		{
			$.ajax({
				type: "post",
				dataType: 'json',
				url: ajax_url,
				data:form.serialize(),
				beforeSend: function() {
					$('.summary.entry-summary.item-info').block({ message: null });
				},
				success: function(json) {
					
					if(json.type == "notice")
					{
						$.growl.notice({ message: json.message });
						$('html, body').animate({
							scrollTop: $('header').offset().top
						}, 500);
						$( ".cart-counter" ).effect('shake', 'slow' );
					}
					else if(json.type == "error")
					{
						$.growl.error({ message: json.message });
					}
					cart_text.html(json.total);
					$('.summary.entry-summary.item-info').unblock();

				}
			});
		}
	});
	
	/* == Coupon Functions == */
	$('body').on('click', 'button.submitcouponcode', function(e) {
		e.preventDefault();
		var form = $("form.couponform");
		$.ajax({
			type: "post",
			dataType: 'json',
			url: ajax_url,
			data:form.serialize(),
			beforeSend: function() {
				form.block({ message: null });
			},
			success: function(json) {
				if(json.type == "notice")
				{
					$.growl.notice({ message: json.message });
					$( ".cart-collaterals" ).effect('shake', 'slow' );
				}
				else if(json.type == "warning")
				{
					$.growl.warning({ message: json.message });
				}
				
				if(json.discount) $('discount').html(json.discount);
				if(json.totalamount) $('totalamount').html(json.totalamount);

				form.unblock();

			}
		});
	});
	
	/* == Master Form == */
	$('body').on('click', 'form.software_form button[name="doSubmit"]', function(e) {
			
		e.preventDefault();
		var form = $(this).closest("form.software_form");
		
		var ajaxresult = $(".ajax-result");
		$.ajax({
			type: "post",
			dataType: 'json',
			url: ajax_url,
			data:form.serialize(),
			beforeSend: function() {
				form.block({ message: null });
			},
			success: function(json) {
				
				if(json.type == "notice")
				{
					$.growl.notice({ message: json.message });
				}
				else if(json.type == "error")
				{
					$.growl.error({ message: json.message });
				}
				else if(json.type == "warning")
				{
					$.growl.warning({ message: json.message });
				}
				
				if(json.ajax_result)
				{
					ajaxresult.html(json.ajax_result);
					ajaxresult.slideDown();
					$('html, body').animate({
						scrollTop: ajaxresult.offset().top
					}, 2000);
				}
				
				if(json.redirect) window.location = json.redirect;
				
				form.unblock();

			}
		});
		
	});
   
});