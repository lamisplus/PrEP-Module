package org.lamisplus.modules.prep;

import com.foreach.across.AcrossApplicationRunner;
import com.foreach.across.config.AcrossApplication;

@AcrossApplication(
		modules = {
				
		}
)
public class PrepModule
{
	public static void main( String[] args ) {
		AcrossApplicationRunner.run( PrepModule.class, args );
	}
}
