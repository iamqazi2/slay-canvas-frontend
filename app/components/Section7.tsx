import MainHeading from './Headings/MainHeading'
import Sec7Card from './cards/Sec7Card'
import Sec7Testimonials from './cards/Sec7Testimonials'

const Section7 = () => {

    return (
        <div className='bg-gradient-to-r from-[#8e5eff2f] to-[#4596ff2e] w-full px-[7.5px] overflow-hidden'>
            <div className='pt-12 pb-15 main-container'>
                <MainHeading
                    text='What our users say about us'
                    text2='Experience the power of our AI-powered creative workspace with real product demonstrations.'
                    fontSize='text-2xl sm:text-3xl md:text-4xl'
                    width='max-w-140'
                    subFontSize='text-[18px] md:text-[20px]'
                    leading='pb-2.5'
                />


                <Sec7Card />

                <Sec7Testimonials />
            </div>
        </div>
    )
}

export default Section7