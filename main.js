document.addEventListener('DOMContentLoaded', () => {
    const URL = 'http://localhost:3000/api/v1/calorie_entries'
    const calorieList = document.querySelector('#calories-list')
    const calculateForm = document.querySelector('#bmr-calulator')
    const lowBMRRange = document.querySelector('span#lower-bmr-range')
    const highBMRRange = document.querySelector('span#higher-bmr-range')
    const newCalorieIntake = document.querySelector('#new-calorie-form')
    const editCalorieIntake = document.querySelector('#edit-calorie-form')
    const progressBar = document.querySelector('#bmr-calculation-result > progress')
    let calorieProgress = 0

    function fetchItems() {
        fetch(URL).then(rsp => rsp.json()).then(renderCalorieList)
    }
    
    function renderCalorieList(arr) {
        calorieList.innerHTML = ""
        arr.forEach((calorieItem) => {
            makeCalorieItem(calorieItem)
        })
    }

    function makeCalorieItem(calorieItem) {
        calorieList.innerHTML += `
        <li class="calories-list-item" data-id=${calorieItem.id}>
            <div class="uk-grid">
                <div class="uk-width-1-6">
                    <strong>${calorieItem.calorie}</strong>
                    <span>kcal</span>
                </div> 
                <div class="uk-width-4-5">
                    <em class="uk-text-meta">${calorieItem.note}</em>
                </div>
            </div>
            <div class="list-item-menu">
                <a class="edit-button" uk-icon="icon: pencil" uk-toggle="target: #edit-form-container"></a>
                <a class="delete-button" uk-icon="icon: trash"></a>
            </div>
        </li>`
        calorieProgress += calorieItem.calorie
        progressBar.value = calorieProgress
    }

    const deleteItem = (itemId) => {
        const config = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'aplication/json'
            }
        }
        fetch(`${URL}/${itemId}`, config)
            .then(rsp => rsp.json())
            .then(fetchItems)
    }

    calorieList.addEventListener('click', (e) => {
        if(e.target.dataset.svg === 'trash'){
            const calorieId = e.target.parentElement.offsetParent.dataset.id
            deleteItem(calorieId)
        }
        else if(e.target.dataset.svg === 'pencil'){
            calorieId = e.target.parentElement.offsetParent.dataset.id
            const parent = e.target.parentElement.offsetParent
            let caloriePlacement = parseInt(parent.querySelector('.uk-width-1-6').innerText)
            let notePlacement = parent.querySelector('.uk-width-4-5').innerText
            editCalorieIntake.dataset.editingId = calorieId
            editCalorieIntake.calories.value = caloriePlacement
            editCalorieIntake.note.value = notePlacement
        }
    })
    
    newCalorieIntake.addEventListener('submit', (e) => {
        e.preventDefault()
        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                api_v1_calorie_entry: {
                    'calorie': `${parseInt(e.target.calories.value)}`,
                    'note': `${e.target.note.value}`
                }
            })
        }
        fetch(URL, config)
        .then(rsp => rsp.json())
        .then(calItem => {
            e.target.reset()
            makeCalorieItem(calItem)
        })
    }) 

    editCalorieIntake.addEventListener('submit', (e) => {
        e.preventDefault()
        const id = e.target.dataset.editingId
        const config = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                api_v1_calorie_entry: {
                    'calorie': `${parseInt(e.target.calories.value)}`,
                    'note': `${e.target.note.value}` 
                }
            })
        }

        fetch(`${URL}/${id}`, config)
        .then(rsp => rsp.json())
        .then(() => {
            e.target.dataset.editingId = ""
            e.target.reset()
            e.target.parentElement.offsetParent.classList.remove('uk-open')
            fetchItems()
        })
        .catch(err => console.log(err))
        
    })

    calculateForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const lowRange = Math.round(655 + (4.35 * `${e.target.weight.value}`) + (4.7 * `${e.target.height.value}`) - (4.7 * `${e.target.age.value}`))

        const highRange = Math.round(66 + (6.23 * `${e.target.weight.value}`) + (12.7 * `${e.target.height.value}`) - (6.8 * `${e.target.age.value}`))

        e.target.reset()
        progressBar.max = (lowRange + highRange) / 2
        lowBMRRange.innerText = lowRange
        highBMRRange.innerText = highRange
    })
    fetchItems()
})