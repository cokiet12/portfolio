<svelte:options accessors />

<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { devuimode } from '$lib/store.mjs';
	import Button from '$lib/nested/button.svelte';
	import Table from '$lib/nested/table.svelte';
	import Searcher from '$lib/nested/searcher.svelte';
	import Input from '$lib/nested/input.svelte';
	import { ajax } from '$lib/js/functions.mjs';
	import _ from 'lodash';

	export let id;
	export let winMode = false;

	const consts = {
		option: [
			{ id: 0, text: 'MCU' },
			{ id: 1, text: 'SCU' }
		]
	};
	let stats = {
		lcno: 1,
		sano: 1,
		year: 2010
	};
	let elems = {
		table1: null
	};
	// Table
	let table1;

	// Initial Datas
	let iData;

	// Datas
	let data = [];

	// Files
	let file = [];

	// Cells
	let optionC = function (row, col, prop) {
		let cellProperties = {};
		if (col != 0 && col != 5 && col != 6 && col != 8) {
			cellProperties.readOnly = false;
			if (col == 1) {
				cellProperties.editor = 'select';
				cellProperties.selectOptions = ['MCU', 'SCU'];
			}
		} else {
			cellProperties.readOnly = true;
		}
		return cellProperties;
	};

	// Option
	let option = {
		height: '362px',
		colWidths: [30, 40, 70, 60, 45, 130, 40, 30, 70],
		rowHeights: 34,
		renderer: 'html',
		renderAllRows: true,
		nestedHeaders: [
			[
				{ label: 'ID', colspan: 1 },
				{ label: '종류', colspan: 1 },
				{ label: '제조사코드', colspan: 1 },
				{ label: '모듈번호', colspan: 1 },
				{ label: '버전', colspan: 1 },
				{ label: '파일', colspan: 1 },
				{ label: '크기', colspan: 1 },
				{ label: 'CRC32', colspan: 1 },
				{ label: '등록일시', colspan: 1 }
			]
		],
		cells: optionC,
		afterSelectionEnd: function (x1, y1, x2, y2) {
			if ((x1 <= x2 && y1 < y2) || (x1 < x2 && y1 <= y2) || (x1 == x2 && y1 == y2)) {
				row1 = x1;
				if (x1 == 0) row2 = parseInt(x2 + 1);
				else row2 = x2;
			} else if ((x1 >= x2 && y1 > y2) || (x1 > x2 && y1 >= y2)) {
				row1 = x2;
				if (x2 == 0) row2 = parseInt(x1 + 1);
				else row2 = x1;
			} else if (x1 < x2 && y1 > y2) {
				row1 = x1;
				row2 = x2;
			} else if (x1 > x2 && y1 < y2) {
				row1 = x2;
				row2 = x1;
			}
		},
		manualColumnResize: false
	};

	// Add
	let addId = new Array();

	// Del
	let delId = new Array();

	// Row
	let row1 = null;
	let row2 = null;

	// 2D Array to Json
	function atoj(arr) {
		let keys = arr[0];
		let newArr = arr.slice(1, arr.length);
		let formatted = [],
			data = newArr,
			cols = keys,
			l = cols.length;
		for (let i = 0; i < data.length; i++) {
			let d = data[i],
				o = {};
			for (let j = 0; j < l; j++) o[cols[j]] = d[j];
			formatted.push(o);
		}
		return formatted;
	}

	// 파일사이즈 변경(num to data)
	function ntod(val) {
		if (val) {
			if (val >= 0 && val < 1024) {
				return val + 'B';
			} else if (val >= 1024 && val < 1048576) {
				return Math.round(val / 1024) + 'KB';
			} else {
				return Math.round(val / 1024 / 1024) + 'MB';
			}
		} else {
			return 'X';
		}
	}

	// 데이터 변경(number to string)
	function ntos(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			// ID, 종류
			v.fw_id = v.fw_id == 0 ? '' : v.fw_id;
			v.fw_type = v.fw_type == '0' ? '' : v.fw_type == '1' ? 'MCU' : 'SCU';

			// 제조사, 모듈
			v.fw_manufacturer = v.fw_manufacturer ? v.fw_manufacturer : '';
			v.fw_module_no = v.fw_module_no ? v.fw_module_no : '';

			// 버전
			v.fw_ver_major = v.fw_ver_major == 0 ? '' : v.fw_ver_major;
			v.fw_ver_minor = v.fw_ver_minor == 0 ? '' : v.fw_ver_minor;
			v.fw_ver_module = v.fw_ver_module == 0 ? '' : v.fw_ver_module;
			v.fw_ver_rev = v.fw_ver_rev == 0 ? '' : v.fw_ver_rev;
			v.fw_version =
				v.fw_ver_major + '.' + v.fw_ver_minor + '.' + v.fw_ver_module + '.' + v.fw_ver_rev;

			// 파일, 바이너리, 크기
			v.fw_filename = v.fw_filename ? v.fw_filename : '파일 없음';
			v.fw_size = ntod(v.fw_size);
			// v.fw_binary = !v.fw_binary || v.fw_binary == "b''" ? '' : (v.fw_binary == "@DataType:Blob")

			// crc32, 등록일시
			v.fw_crc32 = v.fw_crc32 ? v.fw_crc32 : '';
			v.fw_credate = v.fw_credate ? v.fw_credate.replace('T', ' ') : '';
		});

		return res;
	}

	// 데이터 변경(string to number)
	function ston(arr) {
		let res = JSON.parse(JSON.stringify(arr));

		res.forEach((v, i) => {
			// ID, 종류
			v.fw_id = v.fw_id == '' ? 0 : v.fw_id;
			v.fw_type = v.fw_type == '' ? '0' : v.fw_type == 'MCU' ? '1' : '2';

			// 제조사, 모듈
			v.fw_manufacturer = v.fw_manufacturer ? v.fw_manufacturer : '';
			v.fw_module_no = v.fw_module_no ? v.fw_module_no : '';

			// 버전
			let split = v.fw_ver ? v.fw_ver.split('.') : ['0', '0', '0', '0'];
			v.fw_ver_major = Number(split[0]) ? Number(split[0]) : 0;
			v.fw_ver_minor = Number(split[1]) ? Number(split[1]) : 0;
			v.fw_ver_module = Number(split[2]) ? Number(split[2]) : 0;
			v.fw_ver_rev = Number(split[3]) ? Number(split[3]) : 0;

			// 파일, 바이너리, 크기
			let filter = file.filter((value) => value.id == v.fw_id)[0];
			v.fw_filename = filter ? filter.name : '';
			v.fw_size = filter ? filter.size : 0;
			v.fw_binary = filter ? filter.binary : '';

			// crc32, 등록일시
			v.fw_crc32 = v.fw_crc32 ? v.fw_crc32 : '';

			let today = new Date();
			let year = today.getFullYear();
			let month = ('0' + (today.getMonth() + 1)).slice(-2);
			let day = ('0' + today.getDate()).slice(-2);
			let hours = ('0' + today.getHours()).slice(-2);
			let minutes = ('0' + today.getMinutes()).slice(-2);
			let seconds = ('0' + today.getSeconds()).slice(-2);

			v.fw_credate = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;

			delete v.fw_ver;
		});

		return res;
	}

	// 조회
	function searchData(e) {
		ajax('/NTCS_M_FIRMWARE/GetBy').then((res) => {
			let _data = [[1, '', '', '', '', '', '', '', '']];
			if (res) {
				let length;
				if (typeof res == 'object') {
					length = Object.keys(res).length;
				} else {
					length = res.length;
				}

				if (length) {
					let temp = res.sort((a, b) => a.fw_id - b.fw_id);
					iData = temp;
					let _res = ntos(temp);
					_data = [];
					_res.forEach((v, i) => {
						_data.push([
							v.fw_id,
							v.fw_type,
							v.fw_manufacturer,
							v.fw_module_no,
							v.fw_version,
							v.fw_filename,
							v.fw_size,
							v.fw_crc32,
							v.fw_credate
						]);
					});
				} else {
					iData = undefined;
					addId.push(1);
				}
				if (e) {
					document.isSuccess(res);
				}
			}
			table1.loadData(_data);
		});
	}

	// 파일등록
	function registerFile() {
		if (row1 != null) {
			let fileSelector = document.createElement('input');
			fileSelector.setAttribute('type', 'file');
			fileSelector.click();
			fileSelector.addEventListener('change', (e) => {
				table1.setDataAtCell(row1, 5, fileSelector.files[0].name);
				table1.setDataAtCell(row1, 6, ntod(fileSelector.files[0].size));
				let id = table1.getDataAtCell(row1, 0);
				binaryFile(fileSelector.files[0], id);
			});
		} else {
			console.log('row가 선택되지 않았습니다.');
		}
	}

	// 파일 바이너리
	function binaryFile(_file, id) {
		let reader = new FileReader();
		reader.onload = function () {
			let res = reader.result.split(',')[1];
			let filter = file.filter((v) => v.id == id);
			if (filter.length) {
				file = file.filter((v) => v.id != id);
				file.push({ id: id, name: _file.name, size: _file.size, binary: res });
			} else {
				file.push({ id: id, name: _file.name, size: _file.size, binary: res });
			}
		};
		reader.onerror = function (e) {
			console.log(e);
		};
		reader.readAsDataURL(_file);
	}

	// 추가
	function addRow() {
		let row = table1.countRows();
		let indexArray = table1.getDataAtCol(0);

		for (let i = 0; i < indexArray.length; i++) {
			if (indexArray[i] === 9999) {
				indexArray.splice(i, 1);
				i--;
			}
		}

		let autoIncrease;

		if (indexArray.length == 0) {
			autoIncrease = 0;
		} else {
			autoIncrease = indexArray[indexArray.length - 1];
		}

		if (typeof autoIncrease == 'string') {
			console.log('!0잘못된 번호입니다.');
		} else {
			table1.alter('insert_row', row, 1);

			// 데이터 입력
			table1.setDataAtCell(row, 0, autoIncrease + 1);
			table1.selectCell(row, 0);

			addId.push(autoIncrease + 1);
			if (delId.includes(autoIncrease + 1)) {
				var search = delId.indexOf(autoIncrease + 1);
				if (search != -1) {
					delId.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			}
		}
	}

	// 삭제
	function delRow() {
		if (row1 != null) {
			let delIdNo = table1.getSourceDataAtCell(row1, 0);
			table1.alter('remove_row', row1);
			table1.selectCell(row1 - 1, 0);

			if (addId.includes(delIdNo)) {
				var search = addId.indexOf(delIdNo);
				if (search != -1) {
					addId.splice(search, 1); // "A"를 찾아서 삭제한다.
				}
			} else {
				delId.push(delIdNo);
			}
		} else {
			document.createMsg('제거할 줄을 선택해주세요!');
		}
	}

	// 범례
	function verSeq(e) {
		document.createWindow('verSeq', id, e);
	}

	// 저장
	function saveData() {
		let _res = table1.getSourceData();
		let _iData = iData ? JSON.parse(JSON.stringify(iData)) : [];

		let dtKeys = [
			'fw_id',
			'fw_type',
			'fw_manufacturer',
			'fw_module_no',
			'fw_ver',
			'fw_filename',
			'fw_size',
			'fw_crc32',
			'fw_credate'
		];

		_res.unshift(dtKeys);

		let jsonArray = atoj(_res);
		let _jsonArray = ston(jsonArray);

		let temp = _iData.filter((value) => !delId.includes(value.fw_id));
		let _temp = _jsonArray.filter((value) => !addId.includes(value.fw_id));

		// 추가 항목
		let addArray = _jsonArray.filter((value) => addId.includes(value.fw_id));

		for (var i = 0; i < addArray.length; i++) {
			addArray[i].fw_credate = addArray[i].fw_credate.replace('T', ' ');
		}

		addArray.forEach((v, i) => {
			v.datamodetype = 1;
		});

		// 삭제 항목
		let deleteArray = new Array();

		for (let i in delId) {
			deleteArray.push({
				datamodetype: 3,
				fw_id: delId[i]
			});
		}

		// 수정 항목
		let updateArray = new Array();

		temp.forEach((v, i) => {
			let cnt = 0;

			let _v = _temp.filter((value) => value.fw_id == v.fw_id)[0];

			if (_v) {
				// CRC32
				if (v.fw_crc32) {
					if (v.fw_crc32 != _v.fw_crc32) {
						v.fw_crc32 = _v.fw_crc32;
						cnt++;
					}
				} else {
					if (_v.fw_crc32) {
						v.fw_crc32 = _v.fw_crc32;
						cnt++;
					} else {
						v.fw_crc32 = '';
					}
				}

				// 제조사코드
				if (v.fw_manufacturer) {
					if (v.fw_manufacturer != _v.fw_manufacturer) {
						v.fw_manufacturer = _v.fw_manufacturer;
						cnt++;
					}
				} else {
					if (_v.fw_manufacturer) {
						v.fw_manufacturer = _v.fw_manufacturer;
						cnt++;
					} else {
						v.fw_manufacturer = '';
					}
				}

				// 모듈번호
				if (v.fw_module_no) {
					if (v.fw_module_no != _v.fw_module_no) {
						v.fw_module_no = _v.fw_module_no;
						cnt++;
					}
				} else {
					if (_v.fw_module_no) {
						v.fw_module_no = _v.fw_module_no;
						cnt++;
					} else {
						v.fw_module_no = '';
					}
				}

				// 종류
				if (v.fw_type) {
					if (v.fw_type != _v.fw_type) {
						v.fw_type = _v.fw_type;
						cnt++;
					}
				} else {
					if (_v.fw_type) {
						v.fw_type = _v.fw_type;
						cnt++;
					} else {
						v.fw_type = '1';
					}
				}

				if (v.fw_ver_major != _v.fw_ver_major) {
					v.fw_ver_major = _v.fw_ver_major;
					cnt++;
				}
				if (v.fw_ver_minor != _v.fw_ver_minor) {
					v.fw_ver_minor = _v.fw_ver_minor;
					cnt++;
				}
				if (v.fw_ver_module != _v.fw_ver_module) {
					v.fw_ver_module = _v.fw_ver_module;
					cnt++;
				}
				if (v.fw_ver_rev != _v.fw_ver_rev) {
					v.fw_ver_rev = _v.fw_ver_rev;
					cnt++;
				}

				// 바이너리
				if (v.fw_binary && _v.fw_binary && v.fw_binary != _v.fw_binary) {
					// MARIADB
					v.fw_binary = v.fw_binary.replace("b'", '');
					v.fw_binary = v.fw_binary.replace("'", '');

					v.fw_binary = _v.fw_binary;
					cnt++;
				} else {
					if (_v.fw_binary) {
						v.fw_binary = _v.fw_binary;
						cnt++;
					} else {
						v.fw_binary = '';
					}
				}

				// 파일이름
				if (v.fw_filename && _v.fw_filename && v.fw_filename != _v.fw_filename) {
					v.fw_filename = _v.fw_filename;
					cnt++;
				} else {
					if (_v.fw_filename) {
						v.fw_filename = _v.fw_filename;
						cnt++;
					} else {
						v.fw_filename = '';
					}
				}

				// 사이즈
				if (v.fw_size && _v.fw_size && v.fw_size != _v.fw_size) {
					v.fw_size = _v.fw_size;
					cnt++;
				} else {
					if (_v.fw_size) {
						v.fw_size = _v.fw_size;
						cnt++;
					} else {
						v.fw_size = 0;
					}
				}

				// 날짜
				v.fw_credate = v.fw_credate.replace('T', ' ');

				if (cnt != 0) {
					v.datamodetype = 2;
					updateArray.push(v);
				}
			}
		});

		let resultArray = [...addArray, ...deleteArray, ...updateArray];

		console.log('추가 : ', addArray);
		console.log('삭제 : ', deleteArray);
		console.log('수정 : ', updateArray);

		if (resultArray.length != 0) {
			ajax('/NTCS_M_FIRMWARE/UpdateAddDeleteMany', 'PUT', resultArray).then((res) => {
				addId = [];
				delId = [];
				document.isSuccess(res);
			});
		} else {
			document.createMsg('변경된 사항이 없습니다.');
		}
	}

	// 초기 조회
	onMount(() => {
		searchData();
	});
</script>

<div id="main" class:modal={winMode == false} class:win={winMode == true}>
	<div class="EntireDiv">
		<div class="tabletap">
			<Table bind:wrapper={elems.table1} bind:table={table1} {data} {option} />
		</div>
		<div class="btntap">
			<div>
				<Button icon="search" on:click={searchData}>조회</Button>
				<Button icon="plus" on:click={addRow}>추가</Button>
				<Button icon="delete" on:click={delRow}>삭제</Button>
				<Button icon="legend" on:click={verSeq}>범례</Button>
				<Button icon="upload" on:click={registerFile}>파일등록</Button>
			</div>
			<div>
				<Button icon="save2db" colored={true} on:click={saveData}>저장</Button>
			</div>
		</div>
	</div>
</div>

<style>
	/* 메인 */
	#main {
		font-size: 1.3rem;
		background-color: #f9fafb;
		padding: 15px;
		max-height: 1400px;
	}

	/* 창모드 (넓이 고정) */
	#main.win {
		width: 612px;
		height: 426px;
	}

	/* 싱글모드 (창모드 넓이 ~ MAX) */
	#main.modal {
		overflow: auto;
	}

	.EntireDiv {
		box-shadow: 0px 0px 10px #0000000d;
		border: 1px solid #dbe2e6;
		border-radius: 6px;
		background-color: #fff;
		display: grid;
		grid-template-rows: auto;
		grid-row-gap: 10px;
		padding: 10px;
	}

	.tabletap {
		display: grid;
		grid-template-columns: 100%;
	}

	.btntap {
		display: grid;
		grid-template-columns: auto 100px;
	}

	.btntap > div:nth-child(1) {
		display: grid;
		grid-template-columns: 70px 70px 70px 70px 90px;
		grid-column-gap: 5px;
	}

	.btntap > div:nth-child(2) :global(button) {
		width: 100px;
	}

	/* Handsontable */
	/* overflow시 스크롤 */
	/* 창모드 */
	#main.win :global(.tableWrapper > .ht_master > .wtHolder) {
		overflow-x: hidden;
		overflow-y: auto;
	}

	/* 싱글, 듀얼모드 */
	#main.modal :global(.tableWrapper > .ht_master > .wtHolder) {
		overflow: auto;
	}

	#main :global(.handsontable tr td:nth-child(9)) {
		font-size: 1.2rem;
	}
</style>
