$(document).ready(function(){
	var myEvent = {},
		addEventTpl = _.template($('#addEvent').html()),
		id = localStorage.length,
		marker;
		
	function clearForm(){	
		$('#titleEvent').val('');
		$('#descriptionEvent').val('');
		$('#datepicker').val('');
		$('input[name="opinion"]').attr('checked', false);
	}
	//Функция для проверки валидности заполнения формы создания события в дневнике
	function validateForm(){
		if($('#titleEvent').val() === '' || $('#descriptionEvent').val() === '' || $('#datepicker').val() === '' || $("input[name='opinion']").is(':checked') === false){
			return false;
			}
		else return true;
		}
	/*function validateDate(){
	if(!/\d{2}\/\d{2}\/\d{4}/g.test($('#datepicker').val())){
		$('#datepicker').css('borderColor','red').css('backgroundColor','maroon');
			modalNoDate();
			return false;
			}
	}*/
		
	//функция удаляющая пустые элементы в массиве
	function delEmptyInArray(ar){
		var arNew = [];
	  	for (var i = 0; i < ar.length; i++){
			if (ar[i] !== ''){
		   		arNew.push(ar[i]);
		 	}
	  	}
	return arNew;
	}
	//Функции для сортировки записей
	//по времени добавления
	var sortObjectsTime = function(side){
		var arrayOfObjects = [];
		for(i in localStorage){
			//Создаем массив записей из содержимого localStorage
			arrayOfObjects.push(JSON.parse(localStorage.getItem(i)));
			}
			var arrayOfObjects = arrayOfObjects.sort(function(obj1, obj2){
				return obj2.time-obj1.time;
			});

		return arrayOfObjects;
	}
	//по отношению к событию
	var sortObjectsOpinion = function(){
		var arrayOfObjects = [];
		for(i in localStorage){
			arrayOfObjects.push(JSON.parse(localStorage.getItem(i)));
			}
			var arrayOfObjects = arrayOfObjects.sort(function(obj1, obj2){
				return obj1.opinion-obj2.opinion;
			});
			
			return arrayOfObjects;
		}
	//по дате, указанной пользователем
	var sortObjectsDate = function(){
		var arrayOfObjects = [];
		for(i in localStorage){
			arrayOfObjects.push(JSON.parse(localStorage.getItem(i)));
			}
			var arrayOfObjects = arrayOfObjects.sort(function(obj1, obj2){
				return obj2.dateTime-obj1.dateTime;
			});
			
			return arrayOfObjects;
		}
	//Функция для вывода всех событий на страницу
	function showAllEvents(place, sortBy){
		$(place).html('');
		//Если localStorage пустой
		if(localStorage.length === 0){
				$("#content").append('<p>Your diary is empty. Please add the first event, using button in sidebar</p>');
			}
		else {
			arrayOfObjects = sortBy();
            if(place === '#content'){
				$(place).append('<button id="sortTime">Sort by Time</button><button id="sortOp">Sort by Opinion</button><button id="sortDate">Sort by Date</button>');
			}
	 		//перебираем все элементы массива
			for(var i = 0; i < arrayOfObjects.length; i++){
			//Выводим события дневника, в зависимости от атрибута place (в какой элемент DOM помещать)
			if(place === '#content'){
				//в зависимости от отношения к событию, указанном пользователем, назначаем определенный класс создаваемой записи
				switch(arrayOfObjects[i].opinion){
					case '1' : $(place).append('<div class="eventContent positive"></div>'); break;
					case '2' : $(place).append('<div class="eventContent neitral"></div>'); break;
					case '3' : $(place).append('<div class="eventContent negative"></div>'); break;
				}
				//выводим содержимое записи, ссылку для записи в зависимости от ее id, который назначается при добавлении события
				$('.eventContent').last().append('<p class="date">'+arrayOfObjects[i].date.substr(0,10)+'</p><a href=#'+arrayOfObjects[i].id+'><h2>'+arrayOfObjects[i].title+'</h2></a><button title="Delete this event" class="deleteEvent"></button><p style="font-size: '+arrayOfObjects[i].textSize+'; color: '+arrayOfObjects[i].color+'" class="'+arrayOfObjects[i].format+'">' + arrayOfObjects[i].description + '</p>');
				//добавляем обрабочик события на кнопку для удаления события из дневника
				$('.eventContent button').on('click', function(ev){
					ev.preventDefault();
					var evToDel = this;
					//вызываем модальное окно для подтверждения удаления
						$("#dialog").dialog({
							modal: true,
							buttons:[{
								 text: "Yes",
								 click: function() {
									$(this).dialog( "close" );
									//Удаляем саму запись на странице
									$(evToDel).parent().remove();
									//удаляем из localStorage
									localStorage.removeItem('event'+($(evToDel).prev('a').attr('href').slice(1)));
								  }
								},
								{
								text: "No",
								click: function() {
									$( this ).dialog( "close" );
								  	}
								}]
							});
						});
				//Если были добавлены картинки или другие ссылки, показываем их (записаны в массив)
				if(arrayOfObjects[i].link){
					for (var j = arrayOfObjects[i].link.length - 1; j >= 0; j--) {
						//Если это картинка, рисуем ее, если другая ссылка, просто делаем на нее ссылку
						if(/.+\.jpg/g.test(arrayOfObjects[i].link)){
							$('.eventContent').last().append('<p><img src="'+arrayOfObjects[i].link[j]+'"></p>');
						}
						else $('.eventContent').last().append('<p><a href="'+arrayOfObjects[i].link[j]+'">Attached link</a></p>');							
					};
				}
				//Если есть ссылка для youtube, выводим и ее
				if(arrayOfObjects[i].linkTube ){
					$('.eventContent').last().append('<a href='+arrayOfObjects[i].linkTube+'>Watch video</a>')
					// $('.eventContent').last().append('<iframe width="480" height="300" src='+arrayOfObjects[i].linkTube+'frameborder="0" allowfullscreen></iframe>');
				};
				//обработчики событий для кнопок сортировки
				$('#sortTime').on('click', function(){
					$('#content').html('');
					showAllEvents("#content", sortObjectsTime);
				});
				$('#sortOp').on('click', function(){
					$('#content').html('');
					showAllEvents("#content", sortObjectsOpinion);
				});
				$('#sortDate').on('click', function(){
					$('#content').html('');
					showAllEvents("#content", sortObjectsDate);
				});
			}
			else {
				//Вывод списка событий в сайдбар (только названия)
				$(place).append('<a href=#'+arrayOfObjects[i].id+'><h2>'+arrayOfObjects[i].title+'</h2></a>');
				};
			};
		};
	};
	//Функция отрисовывающая страницу в зависимости от значения хэша
	function updateContent(){
		if(location.hash === ''){//если это основная страница, просто рисуем список всех событий
			$('#content').html('');
			//вызываем функцию, выводящую записи (по умолчанию сортировка по времени добавления)
			showAllEvents('#content', sortObjectsTime);
		}
		else if (location.hash === '#add'){
			//Рисуем форму для добавления события через шаблон, определенный в разметке html
			$('#content').html(addEventTpl);
			//Редактор текста
			var text = $('#descriptionEvent');
			var textSize = 20;
			$('#editTextUp').click(function(){
				textSize += 2;
				$(text).css('font-size', textSize+'px');
			});
			$('#editTextDown').click(function(){
				textSize -= 2;
				$(text).css('font-size', textSize+'px');
			});
			$('#editor div').eq(2).click(function(){
				$(text).toggleClass('bold');
			});
			$('#editor div').eq(3).click(function(){
				$(text).toggleClass('italic');
			});
			$('#editor div').eq(4).click(function(){
				$(text).toggleClass('underline');
			});
			$('#editor div').eq(5).click(function(){
				$(text).toggleClass('strike');
			});
			$('#editor div').eq(6).hover(function(){
				$('#colors').show()}, 
				function(){
					$('#colors').hide(); 					
			});
			$('.colorEdit').eq(0).click(function(ev){
				$(text).css('color', 'red');
				$('#colors').hide();
			});
			$('.colorEdit').eq(1).click(function(ev){
				$(text).css('color', 'blue');
				$('#colors').hide();
			});
			$('.colorEdit').eq(2).click(function(ev){
				$(text).css('color', 'green');
				$('#colors').hide();
			});
			$('.colorEdit').eq(3).click(function(ev){
				$(text).css('color', 'yellow');
				$('#colors').hide();
			});
			$('.colorEdit').eq(4).click(function(ev){
				$(text).css('color', 'maroon');
				$('#colors').hide();
			});
			$('.colorEdit').eq(5).click(function(ev){
				$(text).css('color', 'black');
				$('#colors').hide();
			});
			//Добавляем список событий в сайдбар
			showAllEvents('.list', sortObjectsTime);
			$('.list').prepend('<p>Last Events...</p>');
			//обработчик для кнопки добавления изображения
			$('#addImage').on('click', function(ev){
				ev.preventDefault();
				$('#addImage').text('Add more...');
				$(this).after('<input type="text" class="addImage" placeholder="Add URL of image or link">');	
			});
			//обработчик для кнопки добавления карты
			$('#addMap').on('click', function(ev){
				ev.preventDefault();
				//рисуем карту
				$(this).after('<div id="mapWrap"><div id="map"></div><p>Or enter exact coordinates:<p><input type="text" class="addLat" placeholder="Add latitude"><input type="text" class="addLong" placeholder="Add longitude"></div>');	
				var mapOptions = {
				  center: new google.maps.LatLng(49.9945914, 36.2858248),
				  zoom: 6,
				  mapTypeId: google.maps.MapTypeId.ROADMAP
				}
				var map = new google.maps.Map(document.getElementById("map"), mapOptions);
				//обработчик для карты (при клике добавляем маркер события)
				google.maps.event.addListener(map, 'click', function(ev) {
					if(!marker){
						marker = new google.maps.Marker({
						  position: ev.latLng,
						  map: this,
						  title: $('#titleEvent').val(),
						  draggable: true
						});
					}
					//позиция маркера записывается в поля координат
					$('.addLat').val(marker.position.k);
					$('.addLong').val(marker.position.D);
					
					//обработчик для маркера
					google.maps.event.addListener(marker, 'mouseup', function(ev){
						$('.addLat').val(marker.position.k);
						$('.addLong').val(marker.position.D);	
					});

				});

				//обработчик для кнопки ввода координат (чтобы маркер автоматом ставился на карте)
				$('.addLong').on('change', function(){
					if(!marker){
						marker = new google.maps.Marker({
						  position: new google.maps.LatLng(+$('.addLat').val(), +$('.addLong').val()),
						  map: map,
						  title: $('#titleEvent').val(),
						  draggable: true
						});
					}
				else marker.position = new google.maps.LatLng(+$('.addLat').val(), +$('.addLong').val());
				});
			});
				
			$('#datepicker').datepicker();
			//обработчик события на кнопку добавления события в дневник
			$('.addEventButton').on('click', function(ev){
				ev.preventDefault();
				if(validateForm()){
					//если определенный в начале сценария id (изначально длина localStorage) совпадает с уже имеющимся в localStorage объектом, изменяем id
					while(localStorage.getItem('event'+id)){
						id++;
					}
					//Как только нашли свободный id, назначаем его новому объекту
					myEvent.id = id;
					//Новый объект получает данные, согласно заполненным полям 
					myEvent.title = $('#titleEvent').val();
					myEvent.description = $('#descriptionEvent').val();
					myEvent.textSize = $(text).css('fontSize');
					myEvent.color = $(text).css('color');
					myEvent.format = $(text).attr('class');
					myEvent.date = $('#datepicker').datepicker('getDate');//то, что ввел пользователь и будет выводиться в записи
					myEvent.dateTime = myEvent.date.getTime();//преобразуем введенную дату во время, чтобы можно проводить сортировку
					myEvent.time = new Date().getTime();//реальное время создания события
					//если введены данные для добавления "левых" ссылок, все их записываем в массив
					if($('.addImage')){
						myEvent.link = [];
						$.each($('.addImage'), function(){
							myEvent.link.push($(this).val());
						});
						myEvent.link = delEmptyInArray(myEvent.link);//в localStorage записываем чистый массив (без пустых значений)
					}
					myEvent.opinion = $("input[name='opinion']:checked").val();
					if($('#linkTube').val()!==''){
						myEvent.linkTube = $('#linkTube').val();
					}
					if(marker){//если поставлен маркер, записываем его координаты
						myEvent.mapLat = marker.position.k;	
						myEvent.mapLong = marker.position.D;	
					}
					//если координаты введены вручную - они приоритетнее
					if($('.addLat').val() !== ''){
						myEvent.mapLat = $('.addLat').val();
					}
					if($('.addLong').val() !== ''){
						myEvent.mapLong = $('.addLong').val();	
					}
					//Наконец-то записываем объект в localStorage
					localStorage.setItem('event'+id, JSON.stringify(myEvent));
					//Добавляем созданное событие дневника в сайдбар
					$('.list p').after('<a href=#'+id+'><h2>'+myEvent.title+'</h2></a>');
					//очищаем форму
					clearForm();
					$('#descriptionEvent').css('fontSize', '20px').css('color', 'black');
					$('.addImage').remove();
					$('#mapWrap').remove();
				}
				//если введенные данные не прошли валидацию, вызываем соответствующее модальное окно с ошибкой
				else {
					modalNo();
				}
			})
		}
		else if(location.hash === '#map'){//если страница с картой
			showAllEvents('.list', sortObjectsTime);//выводим записи в сайдбар
			$('.list').prepend('<p>Last Events...</p>');
			$('#content').html('');
			//Добавляем карту
			$('#content').append('<h1>Event\'s map</h1><div id="map"></div>');
			var mapOptions = {
				  center: new google.maps.LatLng(50, 30),
				  zoom: 5,
				  mapTypeId: google.maps.MapTypeId.ROADMAP
				}
			var map = new google.maps.Map(document.getElementById("map"), mapOptions);
			arrayOfObjects = sortObjectsTime();	
			//выводим маркеры событий на карту	
			for (var j = 0; j < arrayOfObjects.length; j++) {
				if(arrayOfObjects[j].mapLat){
					var tempMarker = new google.maps.Marker({
					  id: arrayOfObjects[j].id,
					  position: new google.maps.LatLng(arrayOfObjects[j].mapLat, arrayOfObjects[j].mapLong),
					  map: map,
					  title: arrayOfObjects[j].title,
					  draggable: false
					});
					//обработчик на маркеры, который перенаправит на страницу с отдельным событием
					google.maps.event.addListener(tempMarker, 'click', function(ev) {
                        location.hash = '#'+this.id;
					});
				}
			}
		}
		//отрисовываем страницу с просмотром отдельного события дневника
		else {
			showAllEvents('.list', sortObjectsTime);
			$('.list').prepend('<p>Last Events...</p>');
			//Определяем какое событие по его id (записывается в хэш)
			var tmpLink = location.hash.slice(1);
			//Вытаскиваем из localStorage нашу запись
			tmpEvent = JSON.parse(localStorage.getItem('event'+tmpLink));
			//Рисуем ее на странице
			$('#content').html('<p class="date">'+tmpEvent.date.substr(0,10)+'</p><h1>' + tmpEvent.title + '</h1></a><br><p style="font-size: '+tmpEvent.textSize+'; color: '+tmpEvent.color+'" class="'+tmpEvent.format+'">' + tmpEvent.description + '</p>')
			if(tmpEvent.link){
				for (var j = 0; j <= tmpEvent.link.length - 1; j++) {
					if(/.+\.jpg/g.test(tmpEvent.link)){
						$('#content').append('<p><img src="'+tmpEvent.link[j]+'"></p>');
					}
					else $('#content').append('<p><a href="'+tmpEvent.link[j]+'">Attached link</a></p>');							
				};
			}
			if(tmpEvent.linkTube){
				// $('#content').append('<iframe width="420" height="315" src="'+tmpEvent.linkTube+'" frameborder="0" allowfullscreen></iframe>');
				$('#content').append('<p class="video"><a href=' + tmpEvent.linkTube + '>Watch video</a></p>')
			}
			if(tmpEvent.mapLat && tmpEvent.mapLong){
				$('#content').append('<div id="map"></div>');	
					var mapOptions = {
					  center: new google.maps.LatLng(tmpEvent.mapLat, tmpEvent.mapLong),
					  zoom: 10,
					  mapTypeId: google.maps.MapTypeId.ROADMAP
					}
					var map = new google.maps.Map(document.getElementById("map"), mapOptions);
					var marker = new google.maps.Marker({
					  position: new google.maps.LatLng(tmpEvent.mapLat, tmpEvent.mapLong),
					  map: map,
					  title: tmpEvent.title,
					  draggable: false
					});
				}
			}
		}
	//обработчик для кнопки поиска 
	$('#header button').on('click', function(){
		var arrayOfObjects = [];
		for(i in localStorage){
			arrayOfObjects.push(JSON.parse(localStorage.getItem(i)));
			}
		var search = $('#header input').val();
		var pattern = new RegExp('.*'+search+'.*');
		$('#content').html('');
		var res = 0;
		for(j = 0; j < arrayOfObjects.length; j++){
			//если совпало значение для поиска с текстом в названии записи или в ее описании, рисуем запись
			if(pattern.test(arrayOfObjects[j].title) || pattern.test(arrayOfObjects[j].description)){
				res++;
				$('#content').append('<a href=#'+arrayOfObjects[j].id+'><h2>'+arrayOfObjects[j].title+'</h2></a>');
				$('#content').append('<p>'+arrayOfObjects[j].description+'</p>');
				}
			}
		//если ничего не нашлось
		if(res === 0){
			$('#content').append('<p>Sorry... No results</p>');
			}
		});

	//Вызываем функцию при открытии файла
	updateContent();
	//Назначаем обработчик события документу через событие hashchange
	window.addEventListener('hashchange', updateContent);
//функция для вывода модального окна
function modalNo(){
$( "#message" ).dialog({
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
          // clearForm();
        }
      }
    });
}
function modalNoDate(){
$( "#messageDate" ).dialog({
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
          // clearForm();
        }
      }
    });
}
});